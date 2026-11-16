
using System.Globalization;
using System.Runtime.InteropServices.JavaScript;

namespace Service.Helper;

public sealed record WeekDto(int Week, int Year, DateOnly Monday, DateOnly Sunday);

public static class WeekHelper
{
    public static WeekDto For(DateOnly date)
    {
        var dt = date.ToDateTime(TimeOnly.MinValue);
        
        var week = ISOWeek.GetWeekOfYear(dt);
        var year = ISOWeek.GetYear(dt);
        
        var monday = ISOWeek.ToDateTime(year, week, DayOfWeek.Monday);
        
        return new WeekDto(
            week,
            year,
            DateOnly.FromDateTime(monday),
            DateOnly.FromDateTime(monday.AddDays(6)));
            
    }
}