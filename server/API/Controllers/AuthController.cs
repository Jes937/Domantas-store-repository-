using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

//handles Login
[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    [HttpPost("Login")]
    public ActionResult<LoginResponse> Login(LoginRequest loginRequest)
    {
        return Unauthorized("Wrong email or password");
    }
}

//What the client sends
public record LoginRequest(string Email, string Password);

//What client recieves on success
public record LoginResponse(string Token);

