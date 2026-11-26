using Infrastructure;
using Infrastructure.DTOS;
using Infrastructure.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/holidays")]
[Authorize]
public class HolidaysController(HolidaysService holidaysService) : ControllerBase
{
    private Roles CurrentRole =>
        Enum.TryParse<Roles>(
            User.FindFirst("role")?.Value,
            true,
            out var role)
            ? role
            : Roles.Employee;
    
    private bool CanManage(Roles targetRole) =>
        CurrentRole == Roles.SystemOwner;

    [HttpPost]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<HolidaysDB>> create([FromBody] CreateHolidaysRequest request)
    {
        try
        {
            var holidays = await holidaysService.CreateHolidays(
                request.Name,
                request.date);
            return Ok(holidays);
        }
        catch (Exception e)
        {
            return BadRequest(e.Message);
        }
    }

    [HttpGet]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<List<HolidaysDB>>> GetHolidays()
    {
        var holidays = await holidaysService.GetHolidays();
        return Ok(holidays);
    }

    [HttpGet("Range")]
    [Authorize(Roles = "SystemOwner")]
    public async Task<ActionResult<List<HolidaysDB>>> GetHolidaysInRange( DateOnly from, DateOnly to)
    {
        var holidays = await holidaysService.GetHolidaysInRange(from, to);
        return Ok(holidays);
    }
}