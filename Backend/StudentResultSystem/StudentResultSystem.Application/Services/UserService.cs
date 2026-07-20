using StudentResultSystem.Application.DTOs.User;
using StudentResultSystem.Application.Interfaces;
using StudentResultSystem.Domain.Entities;

namespace StudentResultSystem.Application.Services;

public class UserService : IUserService
{
    //private readonly IGenericRepository<User> _userRepository;
    //private readonly IPasswordHasher _passwordHasher;
    private readonly IUserRepository _userRepository;

    private readonly IPasswordHasher _passwordHasher;

    private readonly IRoleRepository _roleRepository;
    public UserService(IUserRepository userRepository, IPasswordHasher passwordHasher, IRoleRepository roleRepository)
    {
        _userRepository = userRepository;
        _passwordHasher = passwordHasher;
        _roleRepository = roleRepository;
    }
    public async Task<UserResponseDto> CreateUserAsync(UserCreateDto dto)
    {
        if (await _userRepository.IsUsernameTakenAsync(dto.Username))
            throw new InvalidOperationException($"Username '{dto.Username}' is already taken.");

        if (await _userRepository.IsEmailTakenAsync(dto.Email))
            throw new InvalidOperationException($"Email '{dto.Email}' is already registered.");

        var defaultRole = await _roleRepository.GetByNameAsync("Student");
        if (defaultRole == null)
            throw new InvalidOperationException("Default 'Student' role not found. Please seed roles first.");

        var user = new User
        {
            Username = dto.Username,
            Email = dto.Email,
            PasswordHash = _passwordHasher.Hash(dto.Password),
            Roles = new List<Role> { defaultRole }
        };

        await _userRepository.AddAsync(user);
        await _userRepository.SaveChangesAsync();

        return MapToResponseDto(user);
    }
    public async Task<UserResponseDto?> GetUserByIdAsync(int id)
    {
        var user = await _userRepository.GetByIdAsync(id);
        return user == null ? null : MapToResponseDto(user);
    }

    public async Task<IEnumerable<UserResponseDto>> GetAllUsersAsync()
    {
        var users = await _userRepository.GetAllAsync();
        return users.Select(MapToResponseDto);
    }

    private static UserResponseDto MapToResponseDto(User user) => new()
    {
        Id = user.Id,
        Username = user.Username,
        Email = user.Email,
        Roles = user.Roles?.Select(r => r.Name).ToList() ?? new List<string>()
    };
}
