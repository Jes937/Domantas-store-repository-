using Infrastructure.Enums;
using LinqToDB.Mapping;
    
namespace Infrastructure;

[Table("LedgerEntries")]
public sealed class LedgerEntriesDB
{
    [PrimaryKey] 
    public string EntrytId { get; set; } = null!;

    [Column("UserId"), NotNull] 
    public string UserId { get; set; } = null!;
    
    [Association(ThisKey = nameof(UserId), OtherKey = nameof(UserDB.UserId))]
    public UserDB User { get; set; } = null!;
    
    [Column ("HolidayAccount"), NotNull]
    public HolidayAccount Account { get; set; }
    
    [Column ("LedgerEntryType"), NotNull]
    public LedgerEntryType EntryType { get; set; }
    
    [Column ("Hours"), NotNull]
    public decimal Hours { get; set; }
    
    [Column ("EntryDate"), NotNull]
    public DateOnly EntryDate { get; set; }
    
    [Column ("ExpiresOn"), Nullable]
    public DateOnly  ExpiresOn { get; set; }
    
    [Column ("RequestId"), Nullable]
    public string? RequestId { get; set; }
    
    [Column ("Note"), Nullable]
    public string? Note { get; set; }
}