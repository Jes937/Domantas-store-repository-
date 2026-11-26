using Infrastructure;
using LinqToDB;
using LinqToDB.Async;

namespace Service;

public class HolidaysService
{
    private readonly UserDataBase _db;
    
    public HolidaysService(UserDataBase db)
    {
        _db = db;
    }

    public async Task<HolidaysDB> CreateHolidays(string holidayName, DateOnly holidayDate, CancellationToken ct = default )
    {
        if (String.IsNullOrWhiteSpace(holidayName))
        {
            throw new ArgumentException("no name");
        }
        
        var holidays = new HolidaysDB
        {
            HolidayID = Guid.NewGuid().ToString(),
            HolidayName =  holidayName,
            HolidayDate =  holidayDate
        };
        await _db.InsertAsync(holidays, token: ct);
        return holidays;    
    }

    public async Task<List<HolidaysDB>> GetHolidays(CancellationToken ct = default)
    {
        var holidays = await _db.GetTable<HolidaysDB>().ToListAsync(ct);
        return holidays;
    }

    public async Task<List<HolidaysDB>> GetHolidaysInRange(DateOnly startDate, DateOnly endDate,
        CancellationToken ct = default)
    {
        var holidays = await _db.GetTable<HolidaysDB>().Where(e => e.HolidayDate.Between(startDate, endDate))
            .ToListAsync(ct);
        return holidays;
    }
}