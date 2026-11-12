using System.Diagnostics;
using API.Controllers;
using Microsoft.AspNetCore.Mvc;

namespace Tests.Unit;

//Unit test: tests the controller directly, without HTTP
public class HealthControllerTests
{
    [Fact]
    public void Get_ReturnsOkWithStatusOk()
    {
        //Arrange
        var controller = new HealthController();
        
        //Act
        var result = controller.Get();
        
        //Assert
        var ok = Assert.IsType<OkObjectResult>(result.Result);
        var body = Assert.IsType<HealthResponse>(ok.Value);
        Assert.Equal("ok", body.Status);
    }
}