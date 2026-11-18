using Infrastructure;
using LinqToDB;
using LinqToDB.Async;

namespace Service;

public class WorkScheduleService
{
    private readonly UserDataBase _db;

    public WorkScheduleService(UserDataBase db)
    {
        _db = db;
    }

    // Get the schedule for the week
    public async Task<ScheduleVersion> GetScheduleAsync(string userId, DateOnly date)
    {
        var monday = MondayOf(date);

        var row = await _db.GetTable<DatesDB>()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.EffectiveFrom == monday);

        return MakeVersion(row);
    }

    // Get all weeks 
    public async Task<List<ScheduleVersion>> GetHistoryAsync(string userId)
    {
        var rows = await _db.GetTable<DatesDB>()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.EffectiveFrom)
            .ToListAsync();

        var result = new List<ScheduleVersion>();

        foreach (var row in rows)
            result.Add(MakeVersion(row));

        return result;
    }

    // Save the schedule for the week 
    public async Task SaveAsync(string userId, DateOnly date, ScheduleHours hours)
    {
        var row = new DatesDB
        {
            UserId = userId,
            EffectiveFrom = MondayOf(date),
            Monday = hours.Monday,
            Tuesday = hours.Tuesday,
            Wednesday = hours.Wednesday,
            Thursday = hours.Thursday,
            Friday = hours.Friday,
            Saturday = hours.Saturday,
            Sunday = hours.Sunday
        };

        await _db.InsertOrReplaceAsync(row);
    }

   
    public async Task<bool> DeleteAsync(string userId, DateOnly date)
    {
        var monday = MondayOf(date);

        var deleted = await _db.GetTable<DatesDB>()
            .Where(x => x.UserId == userId && x.EffectiveFrom == monday)
            .DeleteAsync();

        return deleted > 0;
    }

    
    private static DateOnly MondayOf(DateOnly date)
    {
        int daysSinceMonday = ((int)date.DayOfWeek + 6) % 7;
        return date.AddDays(-daysSinceMonday);
    }

    // Default week
    private static ScheduleHours DefaultHours()
    {
        return new ScheduleHours
        {
            Monday = 7.5m,
            Tuesday = 7.5m,
            Wednesday = 7.5m,
            Thursday = 7.5m,
            Friday = 7m,
            Saturday = 0m,
            Sunday = 0m
        };
    }

    
    private static ScheduleVersion MakeVersion(DatesDB? row)
    {
        var result = new ScheduleVersion();

        if (row == null)
        {
            result.Hours = DefaultHours();
            return result;
        }

        result.EffectiveFrom = row.EffectiveFrom;
        result.ValidUntil = row.EffectiveFrom.AddDays(6);
        result.Hours = new ScheduleHours
        {
            Monday = row.Monday,
            Tuesday = row.Tuesday,
            Wednesday = row.Wednesday,
            Thursday = row.Thursday,
            Friday = row.Friday,
            Saturday = row.Saturday,
            Sunday = row.Sunday
        };

        return result;
    }
}