using EloDeCuidado.Data;
using EloDeCuidado.DTOs.Users;
using EloDeCuidado.Models;
using EloDeCuidado.Services.Helpers;
using Microsoft.EntityFrameworkCore;

namespace EloDeCuidado.Services;

/// <summary>
/// Serviço responsável pelas operações CRUD da entidade User.
/// </summary>
public sealed class UserService(AppDbContext db) : IUserService
{
    /// <inheritdoc />
    public async Task<UserResponse?> GetByIdAsync(int id)
    {
        var user = await db.Users.FindAsync(id);

        return user is null ? null : ToResponse.User(user);
    }

    /// <inheritdoc />
    public async Task<UserResponse> CreateAsync(CreateUserRequest request)
    {
        var user = new User
        {
            Name = request.Name,
            Email = request.Email,
            PasswordHash = PasswordHasher.Hash(request.Password),
        };

        db.Users.Add(user);
        await db.SaveChangesAsync();

        return ToResponse.User(user);
    }

    /// <inheritdoc />
    public async Task<User?> GetByEmailAsync(string email) =>
        await db.Users.FirstOrDefaultAsync(u => u.Email == email);

    /// <inheritdoc />
    public async Task<bool> EmailExistsAsync(string email) =>
        await db.Users.AnyAsync(u => u.Email == email);

    /// <inheritdoc />
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
            user.PasswordHash = PasswordHasher.Hash(request.Password);

        user.UpdatedAt = DateTime.UtcNow;

        await db.SaveChangesAsync();

        return ToResponse.User(user);
    }

    /// <inheritdoc />
    public async Task<bool> DeleteAsync(int id)
    {
        var user = await db.Users.FindAsync(id);

        if (user is null)
            return false;

        db.Users.Remove(user);
        await db.SaveChangesAsync();

        return true;
    }
}
