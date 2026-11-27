using Infrastructure;
using Infrastructure.Enums;

namespace Service.Holiday;

public static class HolidayBalance
{
    public static decimal Available(
        HolidayAccount account,
        IEnumerable<LedgerEntriesDB> entries,
        IEnumerable<HolidayRequestDB> requests,
        DateOnly? onDate = null)
    {
        var mine = entries.Where(e => e.Account == account).ToList();
        
        var earned = mine.Where(e => e.EntryType == LedgerEntryType.Accrual).ToList();
        
        var used = -mine.Where(e => e.EntryType != LedgerEntryType.Accrual).Sum(e => e.Hours)
                   + requests.Where(r => r.Account == account && r.Status == RequestStatus.Pending).Sum(r => r.Hours);
        
        var expired = onDate == null ? 0 : earned.Where(e => e.ExpiresOn < onDate).Sum(e => e.Hours);
        
        return earned.Sum(e => e.Hours) - used - Math.Max(0, expired - used);
    }
}