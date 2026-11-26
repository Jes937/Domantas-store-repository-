using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using LinqToDB.Async;
using Service.Holiday;

namespace Service;

public record AccountBalance(HolidayAccount Account, decimal Hours, DateOnly? ExpiresOn);

public class BalanceService(UserDataBase db)
{
    public async Task<List<AccountBalance>> GetAsync(string userId, DateOnly? date = null)
    {
        var entries = await db.GetTable<LedgerEntriesDB>().Where(x => x.UserId == userId).ToListAsync();
        var request = await db.GetTable<HolidayRequestDB>().Where(x => x.UserId == userId).ToListAsync();
        var schedules = await db.GetTable<DatesDB>().Where(x => x.UserId == userId).ToListAsync();
        var today = DateOnly.FromDateTime(DateTime.Today);
        var onDate = date ?? today;

        return [ForAccount(HolidayAccount.Week1To5), ForAccount(HolidayAccount.Week6)];

        AccountBalance ForAccount(HolidayAccount account)
        {
            var hours = HolidayBalance.Available(account, entries, request);

            if (onDate > today)
                hours += HolidayAccrual.EarnedBetween(schedules, account, today, onDate);
            
            var expiresOn = entries
                .Where(e => e.Account == account && e.ExpiresOn >= today)
                .Min(e => e.ExpiresOn);
            
            return new AccountBalance(account, hours, hours > 0  ? expiresOn : null);
        }
    }
}