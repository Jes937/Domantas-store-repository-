using Infrastructure;
using LinqToDB;
using Microsoft.Extensions.DependencyInjection;
using Service;

namespace Tests.Integration;

public class AccrualTests(ApiFactory factory) : IClassFixture<ApiFactory>
{
    [Fact]
    public async Task EarnForMonth_RunTwice_OnlyEarnsOnce()
    {
        using var scope = factory.Services.CreateScope();
        var accrual = scope.ServiceProvider.GetRequiredService<AccrualService>();
        var db = scope.ServiceProvider.GetRequiredService<UserDataBase>();
        var today = DateOnly.FromDateTime(DateTime.Today);
        
        await accrual.EarnForMonthAsync(today.AddMonths(1));
        await accrual.EarnForMonthAsync(today.AddMonths(1));
        
        Assert.Equal(6, db.GetTable<LedgerEntriesDB>().Count(e => e.EntryDate > today));
    }
}