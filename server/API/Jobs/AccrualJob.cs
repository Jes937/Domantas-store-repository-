using Service;

namespace API.Jobs;

public class AccrualJob(IServiceScopeFactory scopes, ILogger<AccrualJob> logger) : BackgroundService
{
    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(TimeSpan.FromDays(1));

        do
        {
            try
            {
                using var scope = scopes.CreateScope();
                var accrual = scope.ServiceProvider.GetRequiredService<AccrualService>();

                var lastMonth = DateOnly.FromDateTime(DateTime.Today).AddMonths(-1);
                await accrual.EarnForMonthAsync(lastMonth);
            }
            catch (Exception ex)
            {
                logger.LogError(ex, "Holiday accrual failed");
            }
        } while (await timer.WaitForNextTickAsync(stoppingToken));
    }
}