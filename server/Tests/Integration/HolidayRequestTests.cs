using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using API.Controllers;
using Infrastructure;
using Infrastructure.Enums;

namespace Tests.Integration;

public class HolidayRequestTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    
    private static readonly DateOnly Monday = new(2030, 1, 7);

    public HolidayRequestTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }
    
    private async Task LoginAsEmployee()
    {
        var response = await _client.PostAsJsonAsync("/api/Auth/Login",
            new LoginRequest("employee@businessesbjerg.com", "Password123"));

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task Apply_FullWeek_Returns37Hours()
    {
        await LoginAsEmployee();

        var response = await _client.PostAsJsonAsync("/api/holiday-requests",
            new CreateHolidayRequest(Monday, Monday.AddDays(4), HolidayAccount.Week1To5));

        var body = await response.Content.ReadFromJsonAsync<HolidayRequestSummary>();
        Assert.Equal(37m, body!.Hours);
        Assert.Equal(RequestStatus.Pending, body.Status);
    }

    [Fact]
    public async Task Apply_EndBeforeStart_Returns400()
    {
        await LoginAsEmployee();

        var response = await _client.PostAsJsonAsync("/api/holiday-requests",
            new CreateHolidayRequest(Monday, Monday.AddDays(-1), HolidayAccount.Week1To5));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }

    [Fact]
    public async Task Apply_WithoutToken_Returns401()
    {
        var response = await _client.PostAsJsonAsync("/api/holiday-requests",
            new CreateHolidayRequest(Monday, Monday.AddDays(4), HolidayAccount.Week1To5));

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }
    
    [Fact]
    public async Task Apply_MoreThanBalance_Returns400()
    {
        await LoginAsEmployee();

        // Two weeks (74 hours) on Week 6, but there are only 37 hours
        var response = await _client.PostAsJsonAsync("/api/holiday-requests",
            new CreateHolidayRequest(Monday, Monday.AddDays(11), HolidayAccount.Week6));

        Assert.Equal(HttpStatusCode.BadRequest, response.StatusCode);
    }
}