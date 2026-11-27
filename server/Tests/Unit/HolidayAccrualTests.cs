using Infrastructure;
using Infrastructure.Enums;
using Service.Holiday;

namespace Tests.Unit;

public class HolidayAccrualTests
{
    private static readonly DatesDB FullTime = new()
    {
        UserId = "test", EffectiveFrom = new DateOnly(2026, 1, 1),
        Monday = 7.5m, Tuesday = 7.5m, Wednesday = 7.5m, Thursday = 7.5m, Friday = 7m
    };

    private static readonly DatesDB PartTime = new()
    {
        UserId = "test", EffectiveFrom = new DateOnly(2026, 1, 1),
        Monday = 7.5m, Tuesday = 7.5m, Wednesday = 7.5m, Thursday = 7.5m
    };

    [Fact]
    public void FullTime_Earns15_42_OnWeeks1To5()
    {
        Assert.Equal(15.42m, HolidayAccrual.MonthlyHours(FullTime, HolidayAccount.Week1To5));
    }

    [Fact]
    public void FullTime_Earns3_08_OnWeek6()
    {
        Assert.Equal(3.08m, HolidayAccrual.MonthlyHours(FullTime, HolidayAccount.Week6));
    }

    [Fact]
    public void PartTime_EarnsLess()
    {
        Assert.Equal(12.5m, HolidayAccrual.MonthlyHours(PartTime, HolidayAccount.Week1To5));
    }

    private static readonly DateOnly Today = new(2026, 11, 24);

    [Fact]
    public void EarnedUntil_BeforeMonthEnd_IsZero()
    {
        Assert.Equal(0m, HolidayAccrual.EarnedBetween([FullTime], HolidayAccount.Week1To5, Today, new DateOnly(2026, 11, 29)));
    }

    [Fact]
    public void EarnedUntil_EndOfMonth_IsOneMonth()
    {
        Assert.Equal(15.42m, HolidayAccrual.EarnedBetween([FullTime], HolidayAccount.Week1To5, Today, new DateOnly(2026, 11, 30)));
    }

    [Fact]
    public void EarnedUntil_December_IsTwoMonths()
    {
        Assert.Equal(30.84m, HolidayAccrual.EarnedBetween([FullTime], HolidayAccount.Week1To5, Today, new DateOnly(2026, 12, 31)));
    }
}