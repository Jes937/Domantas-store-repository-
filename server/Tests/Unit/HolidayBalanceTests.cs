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
    
    private static LedgerEntriesDB Earned(decimal hours, DateOnly expiresOn) =>
        new() { EntryId = "e", UserId = "test", Account = HolidayAccount.Week1To5, Hours = hours,
            EntryType = LedgerEntryType.Accrual, ExpiresOn = expiresOn };
    
    private static LedgerEntriesDB Taken(decimal hours) =>
        new() { EntryId = "t", UserId = "test", Account = HolidayAccount.Week1To5, Hours = -hours,
            EntryType = LedgerEntryType.Taken };
    
    private static LedgerEntriesDB Week6Earned(decimal hours, DateOnly earnedOn) =>
        new() { EntryId = "w6", UserId = "test", Account = HolidayAccount.Week6, Hours = hours,
            EntryType = LedgerEntryType.Accrual, EntryDate = earnedOn };

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
    
    [Fact]
    public void ExpiredHours_AreGone()
    {
        var available = HolidayBalance.Available(HolidayAccount.Week1To5, 
            [Earned(185, new DateOnly(2026, 12, 31)), Earned(30, new DateOnly(2027, 12, 31))], [], new DateOnly(2027, 1, 1));

        Assert.Equal(30m, available);
    }

    [Fact]
    public void TakenHours_ComeFromTheOldestFirst()
    {
        var available = HolidayBalance.Available(HolidayAccount.Week1To5,
            [Earned(185, new DateOnly(2026, 12, 31)), Earned(30, new DateOnly(2027, 12, 31)), Taken(100)], [], new DateOnly(2027, 1, 1));

        Assert.Equal(30m, available);
    }

    [Fact]
    public void Week6_EarnedThisYear_CanNotBeUsedYet()
    {
        var available = HolidayBalance.Available(HolidayAccount.Week6,
            [Week6Earned(12, new DateOnly(2025, 12, 31)), Week6Earned(30, new DateOnly(2026, 10, 31))],
            [], new DateOnly(2026, 11, 27));
        
        Assert.Equal(12m, available);
    }
}