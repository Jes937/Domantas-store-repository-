using Infrastructure;
using Infrastructure.Enums;

namespace Service.Holiday;

public static class HolidayAccrual
{
    public static decimal MonthlyHours(DatesDB schedule, HolidayAccount account)
    {
        var weeklyHours = schedule.Monday + schedule.Tuesday + schedule.Wednesday
                          + schedule.Thursday + schedule.Friday + schedule.Saturday + schedule.Sunday;

        var weeksPerYear = account == HolidayAccount.Week1To5 ? 5 : 1;

        return Math.Round(weeklyHours * weeksPerYear / 12, 2);
    }
}