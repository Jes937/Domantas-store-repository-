using System.Net;
using System.Net.Http.Json;
using API.Controllers;

namespace Tests.Integration;

//Intergration test: starts the whole API in memory and calls a real endpoint
public class HealthEndpointTests : IClassFixture<ApiFactory>
{
    private readonly HttpClient _client;

    public HealthEndpointTests(ApiFactory factory)
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