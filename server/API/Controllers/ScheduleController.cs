using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/users/{userId}/schedule")]
[Authorize]
public class ScheduleController : ControllerBase
{
    private readonly WorkScheduleService _scheduleService;
    private readonly UserService _userService;

    public ScheduleController(WorkScheduleService scheduleService, UserService userService)
    {
        _scheduleService = scheduleService;
        _userService = userService;
    }

	private bool CanSee(string userId) =>
        User.IsInRole("Accountant") || User.IsInRole("SystemOwner")
        || User.FindFirst(ClaimTypes.NameIdentifier)?.Value == userId;

    // Schedule for a given date 
    [HttpGet]
    public async Task<ActionResult<ScheduleVersion>> Get(string userId, DateOnly? date)
    {
        if (!CanSee(userId))
            return Forbid();

        var user = await _userService.GetUserAsync(userId);
        if (user is null)
            return NotFound();

        var day = date ?? DateOnly.FromDateTime(DateTime.Today);
        var schedule = await _scheduleService.GetScheduleAsync(userId, day);

        return Ok(schedule);
    }

    // All saved versions
    [HttpGet("history")]
    public async Task<ActionResult<List<ScheduleVersion>>> GetHistory(string userId)
    {
        if (!CanSee(userId))
            return Forbid();

        var user = await _userService.GetUserAsync(userId);
        if (user is null)
            return NotFound();

        var history = await _scheduleService.GetHistoryAsync(userId);

        return Ok(history);
    }

  
    [HttpPut("{effectiveFrom}")]
    [Authorize(Roles = "Accountant,SystemOwner")]
    public async Task<IActionResult> Save(string userId, DateOnly effectiveFrom, ScheduleHours hours)
    {
        var user = await _userService.GetUserAsync(userId);
        if (user is null)
            return NotFound();

        if (!HoursAreValid(hours))
            return BadRequest("Hours must be between 0 and 24.");

        await _scheduleService.SaveAsync(userId, effectiveFrom, hours);

        return NoContent();
    }

    // Delete a week
    [HttpDelete("{effectiveFrom}")]
    [Authorize(Roles = "Accountant,SystemOwner")]
    public async Task<IActionResult> Delete(string userId, DateOnly effectiveFrom)
    {
        var deleted = await _scheduleService.DeleteAsync(userId, effectiveFrom);

        if (!deleted)
            return NotFound();

        return NoContent();
    }

    private static bool HoursAreValid(ScheduleHours h)
    {
        decimal[] all = { h.Monday, h.Tuesday, h.Wednesday, h.Thursday, h.Friday, h.Saturday, h.Sunday };

        foreach (var hours in all)
        {
            if (hours < 0 || hours > 24)
                return false;
        }

        return true;
    }
}