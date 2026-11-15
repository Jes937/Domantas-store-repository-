using Microsoft.AspNetCore.Mvc;
using Service;
using LoginApi.Services;

namespace API.Controllers;

//handles Login
[ApiController]
[Route("api/[controller]")]
public class AuthController(AuthService authService, TokenServices tokenServices) : ControllerBase
{
    [HttpPost("Login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest loginRequest)
    {
        var user = await authService.CheckLoginAsync(loginRequest.Email, loginRequest.Password);
        
        //if email or password is wrong
        if (user is null) 
            return Unauthorized("Wrong email or password");
        
        //Login Granted : create token for this user
        var token = tokenServices.CreateToken(user);
        return Ok(new LoginResponse(token));
    }
}

//What the client sends
public record LoginRequest(string Email, string Password);

//What client recieves on success
public record LoginResponse(string Token);

