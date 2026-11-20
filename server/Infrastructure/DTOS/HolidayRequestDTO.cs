using System.ComponentModel.DataAnnotations;
using Infrastructure.Enums;

namespace Infrastructure;

public record CreateHolidayRequest(
    [Required] DateOnly StartDate,
    [Required] DateOnly EndDate,
    [Required] HolidayAccount Account);
    
public record HolidayRequestSummary(
    string RequestId,
    DateOnly StartDate,
    DateOnly EndDate,
    HolidayAccount Account,
    decimal Hours,
    RequestStatus Status);

public record PendingRequest(
    string RequestId,
    string UserName,
    DateOnly StartDate,
    DateOnly EndDate,
    HolidayAccount Account,
    decimal Hours);    