using LinqToDB.Mapping;

namespace Infrastructure;

[Table ("WorkDates")]
public class DatesDB
{
    [PrimaryKey(0), Column("UserId")] 
    public string UserId { get; set; } = null!;
    
    [PrimaryKey(1), Column("EffectiveFrom")]
    public DateOnly EffectiveFrom { get; set; }
    
    [Column("Monday"), NotNull] 
    public decimal Monday { get; set; }
    
    [Column("Tuesday"), NotNull] 
    public decimal Tuesday { get; set; }
    
    [Column("Wednesday"), NotNull] 
    public decimal Wednesday { get; set; }
    
    [Column("Thursday"), NotNull] 
    public decimal Thursday { get; set; }
    
    [Column("Friday"), NotNull] 
    public decimal Friday { get; set; }
    
    [Column("Saturday"), NotNull] 
    public decimal Saturday { get; set; }
    
    [Column("Sunday"), NotNull] 
    public decimal Sunday { get; set; }
}