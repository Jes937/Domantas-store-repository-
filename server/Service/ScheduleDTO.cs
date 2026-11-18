namespace Service;

// Hours per weekday
public class ScheduleHours
{
    public decimal Monday { get; set; }
    public decimal Tuesday { get; set; }
    public decimal Wednesday { get; set; }
    public decimal Thursday { get; set; }
    public decimal Friday { get; set; }
    public decimal Saturday { get; set; }
    public decimal Sunday { get; set; }
}


public class ScheduleVersion
{
    public DateOnly? EffectiveFrom { get; set; }
    public DateOnly? ValidUntil { get; set; }
    public ScheduleHours Hours { get; set; } = new ScheduleHours();
}