using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using LinqToDB.Async;
using Service.Holiday;

namespace Service;

public class HolidayRequestService(UserDataBase db)
{
    public async Task<HolidayRequestSummary> CreateAsync(string userId, CreateHolidayRequest request)
    {
        if (request.EndDate < request.StartDate)
            throw new ArgumentException("End date must be on or after start date");
        
        var schedules = await db.GetTable<DatesDB>()
            .Where(x => x.UserId == userId)
            .ToListAsync();

        if (schedules.Count == 0)
            throw new InvalidOperationException("You don't have a work schedule yet");
        
        var daysOff = new List<DateOnly>();

        var hours = HolidayCalculator.HoursFor(request.StartDate, request.EndDate, schedules, daysOff);

        if (hours == 0)
            throw new ArgumentException("The chosen days are not working days");
        
        // Can't apply for more than you have
        var entries = await db.GetTable<LedgerEntriesDB>()
            .Where(x => x.UserId == userId)
            .ToListAsync();

        var requests = await db.GetTable<HolidayRequestDB>()
            .Where(x => x.UserId == userId)
            .ToListAsync();

        var available = HolidayBalance.Available(request.Account, entries, requests);

        if (hours > available)
            throw new ArgumentException($"Not enough holiday on this account. You have {available:0.##} hours, this costs {hours:0.##}.");

        var row = new HolidayRequestDB
        {
            RequestId = Guid.NewGuid().ToString(),
            UserId = userId,
            Account = request.Account,
            StartDate = request.StartDate,
            EndDate = request.EndDate,
            Hours = hours,
            Status = RequestStatus.Pending,
            Submitted = DateTime.UtcNow
        };

        await db.InsertAsync(row);

        return new HolidayRequestSummary(
            row.RequestId, row.StartDate, row.EndDate, row.Account, row.Hours, row.Status);
    }
    
    public async Task<List<PendingRequest>> GetPendingAsync()
    {
        return await (
                from r in db.GetTable<HolidayRequestDB>()
                join u in db.GetTable<UserDB>() on r.UserId equals u.UserId
                where r.Status == RequestStatus.Pending
                orderby r.StartDate
                select new PendingRequest(r.RequestId, u.UserName, r.StartDate, r.EndDate, r.Account, r.Hours))
            .ToListAsync();
    }
    
  public async Task ApproveAsync(string requestId, string accountantId)
  {
      var request = await GetPendingRequest(requestId);

      await using var transaction = await db.BeginTransactionAsync();

      var updated = await db.GetTable<HolidayRequestDB>()
          .Where(x => x.RequestId == requestId && x.Status == RequestStatus.Pending)
          .Set(x => x.Status, RequestStatus.Approved)
          .Set(x => x.DecidedBy, accountantId)
          .Set(x => x.Decided, DateTime.UtcNow)
          .UpdateAsync();

      if (updated == 0)
          throw new ArgumentException("Request not found or already decided");

      await db.InsertAsync(new LedgerEntriesDB
      {
          EntryId = Guid.NewGuid().ToString(),
          UserId = request.UserId,
          Account = request.Account,
          EntryType = LedgerEntryType.Taken,
          Hours = -request.Hours,
          EntryDate = DateOnly.FromDateTime(DateTime.Today),
          RequestId = request.RequestId
      });

      await transaction.CommitAsync();
  }
    
public async Task RejectAsync(string requestId, string accountantId, string reason)
{
    ArgumentException.ThrowIfNullOrWhiteSpace(reason);

    if (reason.Trim().Length > 500)
        throw new ArgumentException("The reason can be at most 500 characters.");

    var updated = await db.GetTable<HolidayRequestDB>()
        .Where(x => x.RequestId == requestId && x.Status == RequestStatus.Pending)
        .Set(x => x.Status, RequestStatus.Rejected)
        .Set(x => x.DecidedBy, accountantId)
        .Set(x => x.Decided, DateTime.UtcNow)
        .Set(x => x.DecisionNote, reason.Trim())
        .UpdateAsync();

    if (updated == 0)
        throw new ArgumentException("Request not found or already decided");
}
    private async Task<HolidayRequestDB> GetPendingRequest(string requestId)
    {
        var request = await db.GetTable<HolidayRequestDB>()
            .FirstOrDefaultAsync(x => x.RequestId == requestId);

        if (request == null || request.Status != RequestStatus.Pending)
            throw new ArgumentException("Request not found or already decided");

        return request;
    }
public async Task<List<HolidayRequestSummary>> GetOwnAsync(string userId)
{
    var rows = await db.GetTable<HolidayRequestDB>()
        .Where(x => x.UserId == userId)
        .OrderByDescending(x => x.StartDate)
        .ToListAsync();

    return rows
        .Select(x => new HolidayRequestSummary(
            x.RequestId,
            x.StartDate,
            x.EndDate,
            x.Account,
            x.Hours,
            x.Status,
            x.Status == RequestStatus.Rejected ? x.DecisionNote : null))
        .ToList();
}

public async Task CancelAsync(string requestId, string userId)
{
    var updated = await db.GetTable<HolidayRequestDB>()
        .Where(x => x.RequestId == requestId && x.UserId == userId && x.Status == RequestStatus.Pending)
        .Set(x => x.Status, RequestStatus.Cancelled)
        .UpdateAsync();

    if (updated > 0)
        return;

    var request = await db.GetTable<HolidayRequestDB>()
        .FirstOrDefaultAsync(x => x.RequestId == requestId && x.UserId == userId);

    if (request == null)
        throw new ArgumentException("Request not found");

    throw new InvalidOperationException(request.Status switch
    {
        RequestStatus.Approved => "Approved holiday can't be cancelled here. Ask the accountant to cancel it.",
        RequestStatus.Cancelled => "This request is already cancelled.",
        _ => "This request has already been decided."
    });
}

public async Task CancelApprovedAsync(string requestId)
{
    var request = await db.GetTable<HolidayRequestDB>()
        .FirstOrDefaultAsync(x => x.RequestId == requestId);

    if (request == null)
        throw new ArgumentException("Request not found");

    if (request.Status != RequestStatus.Approved)
        throw new ArgumentException(
            "Only approved requests can be cancelled.");

    await using var transaction = await db.BeginTransactionAsync();

    await db.GetTable<HolidayRequestDB>()
        .Where(x => x.RequestId == requestId)
        .Set(x => x.Status, RequestStatus.Cancelled)
        .UpdateAsync();

    await db.InsertAsync(new LedgerEntriesDB
    {
        EntryId = Guid.NewGuid().ToString(),
        UserId = request.UserId,
        Account = request.Account,
        EntryType = LedgerEntryType.Adjustment,
        Hours = request.Hours,
        EntryDate = DateOnly.FromDateTime(DateTime.Today),
        RequestId = request.RequestId
    });

    await transaction.CommitAsync();
}
public async Task<List<PendingRequest>> GetApprovedAsync()
{
    return await (
            from r in db.GetTable<HolidayRequestDB>()
            join u in db.GetTable<UserDB>()
                on r.UserId equals u.UserId
            where r.Status == RequestStatus.Approved
            orderby r.StartDate
            select new PendingRequest(
                r.RequestId,
                u.UserName,
                r.StartDate,
                r.EndDate,
                r.Account,
                r.Hours))
        .ToListAsync();
}
}