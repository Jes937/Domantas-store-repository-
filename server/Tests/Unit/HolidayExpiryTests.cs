using Infrastructure.Enums;
using Service.Holiday;

namespace Tests.Unit;

public class HolidayExpiryTests
{
    [Fact]
    public void Weeks1To5_EarnedInNovember_ExpiresEndOfNextYear()
    {
        Assert.Equal(new DateOnly(2027, 12, 31),
            HolidayExpiry.ExpiresOn(HolidayAccount.Week1To5, new DateOnly(2026, 11, 30)));
    }

    [Fact]
    public void Weeks1To5_EarnedInMarch_ExpiresEndOfSameYear()
    {
        Assert.Equal(new DateOnly(2027, 12, 31),
            HolidayExpiry.ExpiresOn(HolidayAccount.Week1To5, new DateOnly(2027, 3, 31)));
    }

    [Fact]
    public void Week6_ExpiresApril30TwoYearsLater()
    {
        Assert.Equal(new DateOnly(2028, 4, 30),
            HolidayExpiry.ExpiresOn(HolidayAccount.Week6, new DateOnly(2026, 11, 30)));
    }

    [Fact]
    public void Week6_CanBeUsedFrom1MayTheYearAfter()
    {
        Assert.Equal(new DateOnly(2027, 5, 1),
            HolidayExpiry.UsableFrom(HolidayAccount.Week6, new DateOnly(2026, 11, 30)));
    }
}