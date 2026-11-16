<<<<<<< HEAD
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

=======
﻿using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;

namespace API.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController(IConfiguration config) : ControllerBase
{
    [HttpPost("test-token")]
    public IActionResult TestToken(string role = "Admin")
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var token = new JwtSecurityToken(
            claims: [new Claim("role", role)],
            expires: DateTime.UtcNow.AddHours(1),
            signingCredentials: new SigningCredentials(key, SecurityAlgorithms.HmacSha256));

        return Ok(new JwtSecurityTokenHandler().WriteToken(token));
    }
}

//Hello
>>>>>>> UserCRUD
