using System.Diagnostics;
using System.Net;
using System.Net.Http.Json;
using API.Controllers;
using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration;

//Intergration test: starts the whole API in memory and calls a real endpoint
public class HealthEndpointTests : IClassFixture<WebApplicationFactory<Program>>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(WebApplicationFactory<Program> factory)
    {
        _client = factory.CreateClient();
    }

    [Fact]
    public async Task GetHealth_Returns200AndOk()
    {
        var response = await _client.GetAsync("/api/Health");

        Assert.Equal(HttpStatusCode.OK, response.StatusCode);
        var body = await response.Content.ReadFromJsonAsync<HealthResponse>();
        Assert.Equal("ok", body!.Status);
    }
}