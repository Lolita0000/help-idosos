using Microsoft.AspNetCore.Mvc;

namespace EloDeCuidado.Controllers;

[ApiController]
[Route("api/test")]
public sealed class TestController : ControllerBase
{
    [HttpGet("get-hello")]
    public string Get()
    {
        return "Hello World!";
    }
}
