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

    // Admin can manage everyone except admins
    private bool CanManage(Roles targetRole) =>
        CurrentRole == Roles.Admin &&
        targetRole != Roles.Admin;

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
        var deleted = await userService.DeleteUserAsync(id);

        if (!deleted)
            return NotFound();

        return NoContent();
    }
}