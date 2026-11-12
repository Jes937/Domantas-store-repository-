using LinqToDB;
using LinqToDB.Data;

namespace Infrastructure;

public class UserDataBase : DataConnection
{
    public UserDataBase(DataOptions<UserDataBase> options) : base(options.Options)
    {}
}