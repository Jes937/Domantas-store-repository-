using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using LoginApi.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using Service;

namespace API.Controllers;

//Handles login
[ApiController]
[Route("api/[controller]")]
public class AuthController(
    AuthService authService,
    TokenServices tokenServices,
    IConfiguration config,
    IWebHostEnvironment env) : ControllerBase
{
    [HttpPost("Login")]
    public async Task<ActionResult<LoginResponse>> Login(LoginRequest loginRequest)
    {
        var user = await authService.CheckLoginAsync(loginRequest.Email, loginRequest.Password);

        //if email or password is wrong
        if (user is null)
            return Unauthorized("Wrong email or password");

        //Login granted: create token for this user
        var token = tokenServices.CreateToken(user);
        return Ok(new LoginResponse(token));
    }

    //Development only: gives a token without a password, for testing
    [HttpPost("test-token")]
    public IActionResult TestToken(string role = "Admin")
    {
        if (!env.IsDevelopment())
            return NotFound();

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            claims: [new Claim("role", role)],
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return Ok(new JwtSecurityTokenHandler().WriteToken(token));
    }
}

//What the client sends
public record LoginRequest(string Email, string Password);

//What client recieves on success
public record LoginResponse(string Token);