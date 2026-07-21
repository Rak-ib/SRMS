using Microsoft.AspNetCore.Mvc;
using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    public class LoginRequest
    {
        public string Username { get; set; } = null!;
        public string Password { get; set; } = null!;
    }

    [HttpPost("login")]
    public async Task<IActionResult> Login(LoginRequest request)
    {
        var token = await _authService.LoginAsync(request.Username, request.Password);
        if (token == null)
            return Unauthorized("Invalid username or password.");

        return Ok(new { token });
    }
}