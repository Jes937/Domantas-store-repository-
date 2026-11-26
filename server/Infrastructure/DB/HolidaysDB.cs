using LinqToDB.Mapping;

namespace Infrastructure;


[Table("Holidays")]
public class HolidaysDB
{
    [PrimaryKey] 
    public string HolidayID { get; set; } = null!;
    [Column("HolidayName")]
    public string HolidayName { get; set; }
    [Column("HolidayDate")]
    public DateOnly HolidayDate { get; set; }
}