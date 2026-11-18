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

    public async Task<ScheduleVersion> GetScheduleAsync(string userId, DateOnly date)
    {
        var versions = await GetVersionsAsync(userId);

        DatesDB? current = null;
        DatesDB? next = null;

        foreach (var version in versions)
        {
            if (version.EffectiveFrom <= date)
                current = version;
            else if (next == null)
                next = version;
        }

        return MakeVersion(current, next);
    }

    // Get all saved periods
    public async Task<List<ScheduleVersion>> GetHistoryAsync(string userId)
    {
        var versions = await GetVersionsAsync(userId);
        var result = new List<ScheduleVersion>();

        for (int i = 0; i < versions.Count; i++)
        {
            DatesDB? next = null;
            if (i + 1 < versions.Count)
                next = versions[i + 1];

            result.Add(MakeVersion(versions[i], next));
        }

        return result;
    }

    // Create a new period
    public async Task SaveAsync(string userId, DateOnly effectiveFrom, ScheduleHours hours)
    {
        var row = new DatesDB
        {
            UserId = userId,
            EffectiveFrom = effectiveFrom,
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

    // Delete one period
    public async Task<bool> DeleteAsync(string userId, DateOnly effectiveFrom)
    {
        var deleted = await _db.GetTable<DatesDB>()
            .Where(x => x.UserId == userId && x.EffectiveFrom == effectiveFrom)
            .DeleteAsync();

        return deleted > 0;
    }

    private async Task<List<DatesDB>> GetVersionsAsync(string userId)
    {
        return await _db.GetTable<DatesDB>()
            .Where(x => x.UserId == userId)
            .OrderBy(x => x.EffectiveFrom)
            .ToListAsync();
    }

    private static ScheduleVersion MakeVersion(DatesDB? row, DatesDB? next)
    {
        var result = new ScheduleVersion();


        if (row != null)
        {
            result.EffectiveFrom = row.EffectiveFrom;
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
        }

        // Valid until the day before
        if (next != null)
            result.ValidUntil = next.EffectiveFrom.AddDays(-1);

        return result;
    }
}