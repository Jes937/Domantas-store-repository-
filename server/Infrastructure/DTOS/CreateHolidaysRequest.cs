namespace Infrastructure.DTOS;

public record CreateHolidaysRequest(string Name, DateOnly date);