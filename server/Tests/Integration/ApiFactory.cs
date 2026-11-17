using Microsoft.AspNetCore.Mvc.Testing;

namespace Tests.Integration;

public class ApiFactory : WebApplicationFactory<Program>
{
    public ApiFactory()
    {
        var dbFile = Path.Combine(Path.GetTempPath(), $"holiday-test-{Guid.NewGuid()}.db");
        Environment.SetEnvironmentVariable("DB", $"Data Source={dbFile}");
    }
}