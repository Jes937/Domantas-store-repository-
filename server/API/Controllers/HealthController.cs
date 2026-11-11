using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

//Test endpoint to check that the API is running
[ApiController]
[Route("api/[controller]")]
public class HealthController : ControllerBase
{
    //Get /api/Health
    [HttpGet]
    public ActionResult<HealthResponse> Get()
    {
        return Ok(new HealthResponse("ok", DateTime.UtcNow));
    }
}

//Response sent to the client
public record HealthResponse(string Status, DateTime ServerTime);