using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using LinqToDB.Async;
using Service.Holiday;

namespace Service;

public class AccrualService(UserDataBase db)
{
    public async Task EarnForMonthAsync(DateOnly month)
    {
        var lastDay = new DateOnly(month.Year, month.Month, 1).AddMonths(1).AddDays(-1);

        var users = await db.GetTable<UserDB>()
            .Where(u => u.IsActive && u.StartDate <= lastDay)
            .ToListAsync();

        foreach (var user in users)
        {
            var alreadyEarned = await db.GetTable<LedgerEntriesDB>().AnyAsync(e =>
                e.UserId == user.UserId && e.EntryType == LedgerEntryType.Accrual && e.EntryDate == lastDay);
            
            var schedule = await db.GetTable<DatesDB>()
                .Where(s => s.UserId == user.UserId && s.EffectiveFrom <= lastDay)
                .OrderByDescending(s => s.EffectiveFrom)
                .FirstOrDefaultAsync();

            if (alreadyEarned || schedule == null)
                continue;
            
            await using var transaction = await db.BeginTransactionAsync();
            await Earn(user.UserId, schedule, HolidayAccount.Week1To5, lastDay);
            await Earn(user.UserId, schedule, HolidayAccount.Week6, lastDay);
            await transaction.CommitAsync();
        }
    }
    
    private Task Earn(string userId, DatesDB schedule, HolidayAccount account, DateOnly lastDay) =>
        db.InsertAsync(new LedgerEntriesDB
        {
            EntryId = Guid.NewGuid().ToString(),
            UserId = userId,
            Account = account,
            EntryType = LedgerEntryType.Accrual,
            Hours = HolidayAccrual.MonthlyHours(schedule, account),
            EntryDate = lastDay
        });
}