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
}