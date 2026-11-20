using Infrastructure.Enums;

namespace  Infrastructure;

// What the system owner sends when creating a user (in the request body, not the URL)
public record CreateUserRequest(string UserName, string Password, string Email, Roles  Role);

