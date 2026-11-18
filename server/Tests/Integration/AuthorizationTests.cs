using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using API.Controllers;

namespace Tests.Integration;

// Checks that each role can only do what it is allowed to
public class AuthorizationTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public AuthorizationTests(ApiFactory factory)
    {
        _client = factory.CreateClient();
    }

    // Logs in as a test user and puts the token on the client
    private async Task LoginAs(string email)
    {
        var response = await _client.PostAsJsonAsync("/api/Auth/Login",
            new LoginRequest(email, "Password123"));

        var body = await response.Content.ReadFromJsonAsync<LoginResponse>();
        _client.DefaultRequestHeaders.Authorization =
            new AuthenticationHeaderValue("Bearer", body!.Token);
    }

    [Fact]
    public async Task GetUsers_WithoutToken_Returns401()
    {
        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Unauthorized, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_AsEmployee_Returns403()
    {
        await LoginAs("employee@businessesbjerg.com");

        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }

    [Fact]
    public async Task GetUsers_AsSystemOwner_Returns200()
    {
        await LoginAs("owner@businessesbjerg.com");

        var response = await _client.GetAsync("/api/users");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
    }

    [Fact]
    public async Task CreateSecondAccountant_Returns409()
    {
        // There is already a test accountant, so a second one is not allowed
        await LoginAs("owner@businessesbjerg.com");

        var response = await _client.PostAsync(
            "/api/users?userName=Second&password=Password123&email=second@businessesbjerg.com&role=Accountant",
            null);

        Assert.Equal(HttpStatusCode.Conflict, response.StatusCode);
    }
    
    [Fact]
    public async Task GetOtherUsersSchedule_AsEmployee_Returns403()
    {
        await LoginAs("employee@businessesbjerg.com");

        var response = await _client.GetAsync($"/api/users/{Guid.NewGuid()}/schedule");

        Assert.Equal(HttpStatusCode.Forbidden, response.StatusCode);
    }
}