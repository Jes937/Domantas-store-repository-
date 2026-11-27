using Infrastructure.Enums;

namespace Service.Holiday;

public class HolidayExpiry
{
    public static DateOnly ExpiresOn(HolidayAccount account, DateOnly earnedOn)
    {
        if (account == HolidayAccount.Week6)
        {
            return new DateOnly(earnedOn.Year + 2, 4, 30);
        }

        var holidayYearStart = earnedOn.Month >= 9 ? earnedOn.Year : earnedOn.Year - 1;

        return new DateOnly(holidayYearStart + 1, 12, 31);
    }
    
    public static DateOnly UsableFrom(HolidayAccount account, DateOnly earnedOn) =>
        account == HolidayAccount.Week6
            ? new DateOnly(earnedOn.Year + 1, 5, 1)
            : earnedOn;
}