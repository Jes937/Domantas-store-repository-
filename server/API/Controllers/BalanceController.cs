using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Service;

namespace API.Controllers;

[ApiController]
[Route("api/balance")]
[Authorize]
public class BalanceController(BalanceService balanceService) : ControllerBase
{
    [HttpGet]
    public async Task<ActionResult<List<AccountBalance>>> Get()
    {
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)!.Value;
        return Ok(await balanceService.GetAsync(userId));
    }
}