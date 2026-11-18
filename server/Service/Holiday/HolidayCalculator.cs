using Infrastructure;

namespace Service.Holiday;

public static class HolidayCalculator
{
    public static decimal HoursFor(
        DateOnly from,
        DateOnly to,
        IEnumerable<DatesDB> schedules,
        IEnumerable<DateOnly> daysOff)
    {
        if (to < from)
            throw new ArgumentException("End date must be on or after start date");

        var scheduleHistory = schedules.OrderBy(s => s.EffectiveFrom).ToList();
        var daysOffSet = daysOff.ToHashSet();

        decimal total = 0;

        for (var day = from; day <= to; day = day.AddDays(1))
        {
            if (day.DayOfWeek is DayOfWeek.Saturday or DayOfWeek.Sunday)
                continue;
            if (daysOffSet.Contains(day))
                continue;
            
            var schedule = scheduleHistory.LastOrDefault(s => s.EffectiveFrom <= day)
                           ?? throw new InvalidOperationException($"No work schedule for {day}");

            total += HoursOn(schedule, day.DayOfWeek);
        }

        return Math.Round(total, 2);
    }

    private static decimal HoursOn(DatesDB schedule, DayOfWeek day) => day switch
    {
        DayOfWeek.Monday => schedule.Monday,
        DayOfWeek.Tuesday => schedule.Tuesday,
        DayOfWeek.Wednesday => schedule.Wednesday,
        DayOfWeek.Thursday => schedule.Thursday,
        DayOfWeek.Friday => schedule.Friday,
        _ => 0
    };
}