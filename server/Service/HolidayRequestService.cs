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

        request.Status = RequestStatus.Approved;
        request.DecidedBy = accountantId;
        request.Decided = DateTime.UtcNow;
        await db.UpdateAsync(request);

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

        var request = await GetPendingRequest(requestId);

        request.Status = RequestStatus.Rejected;
        request.DecidedBy = accountantId;
        request.Decided = DateTime.UtcNow;
        request.DecisionNote = reason.Trim();
        await db.UpdateAsync(request);
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
}