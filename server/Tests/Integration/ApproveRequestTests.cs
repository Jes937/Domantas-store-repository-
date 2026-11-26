using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using API.Controllers;
using Infrastructure;
using Infrastructure.Enums;

namespace Tests.Integration;

public class ApproveRequestTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;
    
    private static readonly DateOnly Monday = NextMonday();
    
    private static DateOnly NextMonday()
    {
        var day = DateOnly.FromDateTime(DateTime.Today).AddDays(14);
        while (day.DayOfWeek != DayOfWeek.Monday)
            day = day.AddDays(1);
        return day;
    }

    public ApproveRequestTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }
    
    private async Task LoginAs(string email)
    {
        var response = await _client.PostAsJsonAsync("/api/Auth/Login", new LoginRequest(email, "Password123"));
        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        _client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task Approve_AsAccountant_Returns204()
    {
        await LoginAs("employee@businessesbjerg.com");
        var created = await _client.PostAsJsonAsync("/api/holiday-requests",
            new CreateHolidayRequest(Monday, Monday.AddDays(4), HolidayAccount.Week1To5));
        var request = await created.Content.ReadFromJsonAsync<HolidayRequestSummary>();

        await LoginAs("accountant@businessesbjerg.com");
        var response = await _client.PostAsync($"/api/holiday-requests/{request!.RequestId}/approve", null);

        Assert.Equal(HttpStatusCode.NoContent, response.StatusCode);
    }

    [Fact]
    public async Task Approve_AsEmployee_Returns403()
    {
        await LoginAs("employee@businessesbjerg.com");

        var response = await _client.PostAsync($"/api/holiday-requests/{Guid.NewGuid()}/approve", null);

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}