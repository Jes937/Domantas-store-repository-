
using Infrastructure;
using Infrastructure.Enums;
using LinqToDB;
using LinqToDB.Async;
using LinqToDB.Data;
using Security.Services.Security;

namespace Service;

public class UserService
{
    private readonly DataConnection _db;
    private readonly Argon2PasswordHasher _passwordHasher;

    public UserService(DataConnection db, Argon2PasswordHasher passwordHaser)
    {
        _db = db;
        _passwordHasher = passwordHaser;
    }

    public async Task<UserSummary> CreateuserAsync(
        string username,
        string password,
        string email,
        Roles role, 
        //Idea of what we could at as a security feature
        //string passwordQuestion,
        //string passwordAnswer,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(username);
        ArgumentException.ThrowIfNullOrWhiteSpace(password);
        
        //Password length can be made longer if necesarry
        if (password.Length < 8)
            throw new ArgumentException("Password must be at least 8 characters long");
        
        if (await _db.GetTable<UserDB>().AnyAsync(x => x.UserName == username, ct))
            throw new InvalidOperationException("User with the same username already exists");
        
        var user = new UserDB
        {
            UserId = Guid.NewGuid().ToString(),
            UserName = username,
            Email = email,
            Password = _passwordHasher.HashAndSaltPassword(password),
            Role =  role,
            IsActive = true,
            StartDate = DateOnly.FromDateTime(DateTime.Today)
        };
        
        await _db.InsertAsync(user, token: ct);
        return ToSummary(user);
    }


    public async Task<UserSummary?> GetUserAsync(
        string UserId,
        CancellationToken ct = default)
    {
        var user = await _db.GetTable<UserDB>()
            .FirstOrDefaultAsync(x => x.UserId == UserId, ct);

        return user is null ? null : ToSummary(user);
    }

    public async Task<bool> UpdateUserAsync(
        string userId,
        string userName,
        Roles role,
        CancellationToken ct = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(userName);

        var updated = await _db.GetTable<UserDB>()
            .Where(x => x.UserId == userId)
            .Set(x => x.UserName, userName)
            .Set(x => x.Role, role)
            .UpdateAsync(ct);

        return updated > 0;
    }

    public async Task<bool> DeleteUserAsync(
        string userId,
        CancellationToken ct = default)
    {
        var deleted = await _db.GetTable<UserDB>()
            .Where(x => x.UserId == userId)
            .DeleteAsync(ct);

        return deleted > 0;
    }

    public async Task<List<UserSummary>> GetAllUsersAsync(
        CancellationToken ct = default)
    {
        var users = await _db.GetTable<UserDB>().ToListAsync(ct);
        return users.Select(ToSummary).ToList();
    }

    private static UserSummary ToSummary(UserDB user)
    {
        return new UserSummary(user);
    }
    
    
    
        
}
