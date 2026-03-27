using EloDeCuidado.Data;
using EloDeCuidado.DTOs;
using EloDeCuidado.Models;

namespace EloDeCuidado.Services;

public sealed class UserService(AppDbContext db) : IUserService
{
    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        var user = await db.Users.FindAsync(id);

        if (user is null)
            return null;

        return ToResponse(user);
    }

    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = request.Password,
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return ToResponse(user);
    }

    public async Task<UserResponse?> UpdateAsync(int id, UpdateUserRequest request)
    {
        var user = await db.Users.FindAsync(id);

        if (user is null)
            return null;

        if (request.Name is not null)
            user.Name = request.Name;

        if (request.Email is not null)
            user.Email = request.Email;

        if (request.Password is not null)
            user.PasswordHash = request.Password;

        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ToResponse(user);
    }

    public async Task<bool> DeleteAsync(int id)
    {
        var user = await db.Users.FindAsync(id);

        if (user is null)
            return false;

        db.Users.Remove(user);
        await db.SaveChangesAsync();

        return true;
    }

    private static UserResponse ToResponse(User user) =>
        new(user.Id, user.Name, user.Email, user.CreatedAt);
}
