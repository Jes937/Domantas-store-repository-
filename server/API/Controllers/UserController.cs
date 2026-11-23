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
            : Roles.Employee;

    // Admin can manage everyone
    private bool CanManage(Roles targetRole) =>
        CurrentRole == Roles.SystemOwner;

    [HttpPost]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<UserSummary>> Create([FromBody] CreateUserRequest request)
    {
        if (!CanManage(request.Role))
            return Forbid();

        try
        {
            var user = await userService.CreateuserAsync(
                request.UserName,
                request.Password,
                request.Email,
                request.Role);
            
            return Ok(user);
        }
        catch (ArgumentException ex)
        {
            //e.g. password too short
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            //e.g. there is already an accountant, or email in use
            return Conflict(ex.Message);
        }
    }

    [HttpDelete("{id}")]
    [Authorize(Roles = "SystemOwner")]
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
    [Authorize(Roles = "SystemOwner")]
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

        try
        {
            var updated = await userService.UpdateUserAsync(id, userName, role);

            if (!updated)
                return NotFound();
        }
        catch (InvalidOperationException ex)
        {
            // e.g. there is already an accountant
            return Conflict(ex.Message);
        }

        return NoContent();
    }
    
    // READ all
    [HttpGet]
    [Authorize(Roles = "Employee,Accountant,SystemOwner")]
    public async Task<ActionResult<List<UserSummary>>> GetAll()
    {
        var users = await userService.GetAllUsersAsync();
        return Ok(users);
    }
}