using Infrastructure;
using Infrastructure.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/users")]
[Authorize]
public class UserController(UserService userService) : ControllerBase
{
    // Role of the logged-in user from JWT token
    private Roles CurrentRole =>
        Enum.TryParse<Roles>(
            User.FindFirst("role")?.Value,
            true,
            out var role)
            ? role
            : Roles.User;

    // Admin can manage everyone
    private bool CanManage(Roles targetRole) =>
        CurrentRole == Roles.Admin;

    [HttpPost]
    [Authorize(Roles = "Admin")]
    public async Task<ActionResult<UserSummary>> Create(
        string userName,
        string password,
        string email,
        Roles role)
    {
        if (!CanManage(role))
            return Forbid();

        var user = await userService.CreateuserAsync(
            userName,
            password,
            email,
            role);

        return Ok(user);
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Delete(string id)
    {
        var target = await userService.GetUserAsync(id);
        if (target is null)
            return NotFound();

        if (!CanManage(target.Role))
            return Forbid();

        await userService.DeleteUserAsync(id);
        return NoContent();
    }
    
    // UPDATE 
    [HttpPut("{id}")]
    [Authorize(Roles = "Admin")]
    public async Task<IActionResult> Update(
        string id,
        string userName,
        Roles role)
    {
        var target = await userService.GetUserAsync(id);
        if (target is null)
            return NotFound();

        // Check both the current role and the new role
        if (!CanManage(target.Role) || !CanManage(role))
            return Forbid();

        var updated = await userService.UpdateUserAsync(id, userName, role);

        if (!updated)
            return NotFound();

        return NoContent();
    }
    
    // READ all
    [HttpGet]
    public async Task<ActionResult<List<UserSummary>>> GetAll()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
    }
}