using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

//handles Login
[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService) : ControllerBase
{
    [HttpPost("Login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest loginRequest)
    {
        var user = await authService.CheckLoginAsync(loginRequest.Email, loginRequest.Password);
        
        //if email or password is wrong
        if (user is null) 
            return Unauthorized("Wrong email or password");
        
        //token will come soon
        return Ok(new LoginResponse("token-comes-soon"));
    }
}

//What the client sends
public record LoginRequest(string Email, string Password);

//What client recieves on success
public record LoginResponse(string Token);

