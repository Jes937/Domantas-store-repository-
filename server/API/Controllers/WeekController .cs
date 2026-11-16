using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service.Helper;

namespace API.Controllers;

[ApiController]
[Route("api/weeks")]
[Authorize]
public class WeekController : ControllerBase
{
    // Week number for a date (today if no date is given)
    [HttpGet]
    public ActionResult<WeekDto> Get(DateOnly? date)
    {
        var day = date ?? DateOnly.FromDateTime(DateTime.Today);
        return Ok(WeekHelper.For(day));
    }
}