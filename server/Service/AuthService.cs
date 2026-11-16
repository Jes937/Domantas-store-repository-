using Infrastructure;
using LinqToDB;
using LinqToDB.Async;
using Security.Services.Security;

namespace Service;

//checks email and password for login
public class AuthService(UserDataBase db, Argon2PasswordHasher passwordHasher)
{
    //Returns user if email and password match, null if not
    public async Task<UserDB?> CheckLoginAsync(string email, string password)
    {
        //Find the user with this email
        var user = await db.GetTable<UserDB>()
            .FirstOrDefaultAsync(u => u.Email == email);
        
        //if user is not found/deactivated
        if (user is null || !user.IsActive)
            return null;
        
        //Wrong password
        if (!passwordHasher.VerifyHashedPassword(password, user.Password))
            return null;
        
        return user;
    }
}

