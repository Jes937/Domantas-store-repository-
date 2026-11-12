using LinqToDB;

namespace Infrastructure;

public class Seeder
{
    public static void Seed(UserDataBase db)
    {
            db.CreateTable<UserDB>(tableOptions: TableOptions.CreateIfNotExists);
            db.CreateTable<HolidayRequestDB>(tableOptions: TableOptions.CreateIfNotExists);
            db.CreateTable<LedgerEntriesDB>(tableOptions: TableOptions.CreateIfNotExists);    
    }
}