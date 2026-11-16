using Facet;

namespace Infrastructure;

[Facet(typeof(UserDB),
    nameof(UserDB.Password),
    nameof(UserDB.LedgerEntries),
    nameof(UserDB.HolidayRequest))]
public partial record UserSummary;