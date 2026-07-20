using StudentResultSystem.Application.DTOs.User;

namespace StudentResultSystem.Application.Interfaces
{
    public interface IUserService
    {
        Task<UserResponseDto> GetUserByIdAsync(int id);
        //Task<UserResponseDto> GetUserByUsernameAsync(string username);
        //Task<UserResponseDto> GetUserByEmailAsync(string email);
        Task<IEnumerable<UserResponseDto>> GetAllUsersAsync();
        Task<UserResponseDto> CreateUserAsync(UserCreateDto createUserDto);
        //Task<UserDto> UpdateUserAsync(int id, UpdateUserDto updateUserDto);
        //Task<bool> DeleteUserAsync(int id);
    }
}
