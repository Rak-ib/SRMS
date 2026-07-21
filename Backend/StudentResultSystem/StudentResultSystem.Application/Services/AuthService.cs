using StudentResultSystem.Application.Interfaces;

namespace StudentResultSystem.Application.Services;

public class AuthService : IAuthService
{
    private readonly IUserRepository _userRepository;
    private readonly IPasswordHasher _passwordHasher;
    private readonly ITokenGenerator _tokenGenerator;

    public AuthService(IUserRepository userRepository, IPasswordHasher passwordHasher, ITokenGenerator tokenGenerator)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _tokenGenerator = tokenGenerator;
    }

    public async Task<string?> LoginAsync(string username, string password)
    {
        var user = await _userRepository.GetByUsernameAsync(username);
        if (user == null)
            return null;

        var isValid = _passwordHasher.Verify(password, user.PasswordHash);
        if (!isValid)
            return null;

        return _tokenGenerator.GenerateToken(user);
    }
}