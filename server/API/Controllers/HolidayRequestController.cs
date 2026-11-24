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
    public async Task<IActionResult> Reject(string id)
    {
        try
        {
            await holidayRequestService.RejectAsync(id, CurrentUserId, "");
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
}