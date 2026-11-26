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

    public static decimal EarnedBetween(IEnumerable<DatesDB> schedules, HolidayAccount account, DateOnly from, DateOnly to)
    {
        decimal total = 0;
        var monthEnd = new DateOnly(from.Year, from.Month, 1).AddMonths(1).AddDays(-1);

        while (monthEnd <= to)
        {
            var schedule = schedules
                .Where(s => s.EffectiveFrom <= monthEnd)
                .MaxBy(s => s.EffectiveFrom);

            if (schedule != null)
                total += MonthlyHours(schedule, account);

            monthEnd = monthEnd.AddDays(1).AddMonths(1).AddDays(-1);
        }

        return total;
    }
}