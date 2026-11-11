using Infrastructure.Enums;
using LinqToDB.Mapping;

namespace Infrastructure;

[Table( "HolidayRequest")]
public sealed class HolidayRequestDB
{
    [PrimaryKey] 
    public string RequestId { get; set; }
    
        [Column ("UserId"), NotNull]
    public string UserId { get; set; } = null!;

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(UserDB.UserId))]
    public UserDB User { get; set; } = null!;
   
    [Column ("HolidayAccount"), NotNull]
    public HolidayAccount Account { get; set; }
    
    [Column ("StartDate"), NotNull]
    public DateOnly StartDate { get; set; }
    
    [Column ("EndDate"), NotNull]
    public DateOnly EndDate { get; set; }
    
    [Column ("Hours"), NotNull]
    public decimal Hours { get; set; }
    
    [Column ("Status"), NotNull]
    public RequestStatus Status { get; set; }
    
    [Column ("Submitted"), NotNull]
    public DateTime Submitted { get; set; }
    
    [Column ("DecidedBy"), Nullable]
    public string? DecidedBy { get; set; }
    
    [Column ("Decided"), Nullable]
    public DateTime? Decided { get; set; }
    
    [Column ("DecisionNote"), Nullable]
    public string? DecisionNote { get; set; }
}