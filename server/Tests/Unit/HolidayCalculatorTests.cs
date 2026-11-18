using Infrastructure;
using Service.Holiday;

namespace Tests.Unit;

public class HolidayCalculatorTests
{
    private static readonly DateOnly Monday = new(2026, 11, 23);
    private static readonly DateOnly Friday = new(2026, 11, 27);
    
    private static readonly DatesDB FullTime = new()
    {
        UserId = "test",
        EffectiveFrom = Monday,
        Monday = 7.5m, Tuesday = 7.5m, Wednesday = 7.5m, Thursday = 7.5m, Friday = 7m
    };
    
    [Fact]
    public void FullWeek_Costs37Hours()
    {
        var hours = HolidayCalculator.HoursFor(Monday, Friday, [FullTime], []);

        Assert.Equal(37m, hours);
    }

    [Fact]
    public void Weekend_CostsZero()
    {
        var saturday = Friday.AddDays(1);
        var sunday = Friday.AddDays(2);
        
        var hours = HolidayCalculator.HoursFor(saturday, sunday, [FullTime], []);
        
        Assert.Equal(0m, hours);
    }

    [Fact]
    public void PublicHoliday_CostsZero()
    {
        var wednesday = Monday.AddDays(2);
        
        var hours = HolidayCalculator.HoursFor(Monday, Friday, [FullTime], [wednesday]);
        
        Assert.Equal(29.5m, hours);
    }

    [Fact]
    public void PartTime_OnlyWorkdaysCost()
    {
        var partTime = new DatesDB
        {
            UserId = "test",
            EffectiveFrom = Monday,
            Monday = 7.5m, Tuesday = 7.5m, Wednesday = 7.5m
        };
        
        var hours = HolidayCalculator.HoursFor(Monday, Friday, [partTime], []);
        
        Assert.Equal(22.5m, hours);
    }
}