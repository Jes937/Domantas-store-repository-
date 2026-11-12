using LinqToDB.Mapping;

namespace Infrastructure;


// This table is for all the details about a user 
[Table("User")]
public class UserDB
{
    [PrimaryKey] 
    public string UserId { get; set; } = null!;

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(LedgerEntriesDB.UserId))]
    public IEnumerable<LedgerEntriesDB> LedgerEntries { get; set; } = null!;

    [Association(ThisKey = nameof(UserId), OtherKey = nameof(HolidayRequestDB.UserId))]
    public IEnumerable<HolidayRequestDB> HolidayRequest { get; set; } = null!;
    
    [Column ("UserName"), NotNull]
    public string UserName { get; set; } = null!;
    
    [Column ("Email"), NotNull]
    public string Email { get; set; } = null!; 
    
    [Column ("Password"), NotNull]
    public string Password { get; set; } = null!;
    
    [Column ("UserRole"), NotNull]
    public string UserRole { get; set; } = null!;
    
    [Column ("IsActive"), NotNull]
    public bool IsActive { get; set; } = true;
    
    [Column ("EmploymentStartDate"), NotNull]
    public DateOnly StartDate { get; set; }
    
    [Column ("EmplymentEndDate"), Nullable ]
    public DateOnly EndDate { get; set; }
    

    
}