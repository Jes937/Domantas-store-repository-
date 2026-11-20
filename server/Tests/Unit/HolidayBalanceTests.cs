using Infrastructure;
using Infrastructure.Enums;
using Service.Holiday;

namespace Tests.Unit;

public class HolidayBalanceTests
{
    private static LedgerEntriesDB Entry(decimal hours, HolidayAccount account = HolidayAccount.Week1To5) =>
        new() { EntryId = "e", UserId = "test", Account = account, Hours = hours };

    private static HolidayRequestDB Pending(decimal hours) =>
        new() { RequestId = "r", UserId = "test", Account = HolidayAccount.Week1To5, Hours = hours, Status = RequestStatus.Pending };

    [Fact]
    public void EarnedMinusTaken_IsAvailable()
    {
        // Earned 74, already took 37
        var available = HolidayBalance.Available(HolidayAccount.Week1To5, [Entry(74), Entry(-37)], []);

        Assert.Equal(37m, available);
    }

    [Fact]
    public void PendingRequests_AreReserved()
    {
        var available = HolidayBalance.Available(HolidayAccount.Week1To5, [Entry(74)], [Pending(37)]);

        Assert.Equal(37m, available);
    }

    [Fact]
    public void OtherAccount_DoesNotCount()
    {
        var available = HolidayBalance.Available(HolidayAccount.Week1To5, [Entry(37, HolidayAccount.Week6)], []);

        Assert.Equal(0m, available);
    }
}