using System.Security.Claims;
using Infrastructure;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/holiday-requests")]
[Authorize]
public class HolidayRequestController(HolidayRequestService holidayRequestService) : ControllerBase
{
    private string CurrentUserId => User.FindFirst(ClaimTypes.NameIdentifier)!.Value;

    [HttpPost]
    public async Task<ActionResult<HolidayRequestSummary>> Create(CreateHolidayRequest request)
    {
        try
        {
            var created = await holidayRequestService.CreateAsync(CurrentUserId, request);
            return Ok(created);
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }
    
    [HttpGet("pending")]
    [Authorize(Roles = "Accountant")]
    public async Task<ActionResult<List<PendingRequest>>> GetPending()
    {
        return Ok(await holidayRequestService.GetPendingAsync());
    }

    [HttpPost("{id}/approve")]
    [Authorize(Roles = "Accountant")]
    public async Task<IActionResult> Approve(string id)
    {
        try
        {
            await holidayRequestService.ApproveAsync(id, CurrentUserId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return BadRequest(ex.Message);
        }
    }

[HttpPost("{id}/reject")]
[Authorize(Roles = "Accountant")]
public async Task<IActionResult> Reject(
    string id,
    RejectHolidayRequest request)
{
    try
    {
        await holidayRequestService.RejectAsync(
            id,
            CurrentUserId,
            request.Reason
        );

        return NoContent();
    }
    catch (ArgumentException ex)
    {
        return BadRequest(ex.Message);
    }
}

    [HttpGet("mine")]
    public async Task<ActionResult<List<HolidayRequestSummary>>> GetMine()
    {
        return Ok(await holidayRequestService.GetOwnAsync(CurrentUserId));
    }

    [HttpPost("{id}/cancel")]
    public async Task<IActionResult> Cancel(string id)
    {
        try
        {
            await holidayRequestService.CancelAsync(id, CurrentUserId);
            return NoContent();
        }
        catch (ArgumentException ex)
        {
            return NotFound(ex.Message);
        }
        catch (InvalidOperationException ex)
        {
            return BadRequest(ex.Message);
        }
    }

[HttpGet("approved")]
[Authorize(Roles = "Accountant")]
public async Task<ActionResult<List<PendingRequest>>> GetApproved()
{
    return Ok(await holidayRequestService.GetApprovedAsync());
}

[HttpPost("{id}/cancel-approved")]
[Authorize(Roles = "Accountant")]
public async Task<IActionResult> CancelApproved(string id)
{
    try
    {
        await holidayRequestService.CancelApprovedAsync(id);
        return NoContent();
    }
    catch (ArgumentException ex)
    {
        return BadRequest(ex.Message);
    }
}

[HttpGet("calendar")]
public async Task<ActionResult<List<TeamHolidayCalendarItem>>> GetCalendar()
{
    return Ok(await holidayRequestService.GetCalendarAsync());
}
}