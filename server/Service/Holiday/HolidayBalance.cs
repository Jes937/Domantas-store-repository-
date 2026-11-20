using Infrastructure;
using Infrastructure.Enums;

namespace Service.Holiday;

public static class HolidayBalance
{
    public static decimal Available(
        HolidayAccount account,
        IEnumerable<LedgerEntriesDB> entries,
        IEnumerable<HolidayRequestDB> requests)
    {
        var ledger = entries
            .Where(e => e.Account == account)
            .Sum(e => e.Hours);
        
        var pending = requests
            .Where(r => r.Account == account && r.Status == RequestStatus.Pending)
            .Sum(r => r.Hours);

        return ledger - pending;
    }
}