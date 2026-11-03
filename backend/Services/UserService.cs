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

    /// <inheritdoc />
    public async Task<DeleteAccountResult> DeleteAccountAsync(int id)
    {
        var user = await db.Users.FindAsync(id);

        if (user is null)
            return new DeleteAccountResult(DeleteAccountStatus.NotFound);

        // RN-012: um workspace não pode ficar sem administrador. Se o titular
        // administra algum que ainda tem outros participantes, a exclusão é
        // recusada até que ele transfira a administração ou remova os membros.
        // Excluir assim deixaria o histórico de saúde dessas pessoas inacessível.
        var bloqueando = await db.Workspaces
            .Where(w => w.Members.Any(m => m.UserId == id && m.Role == MemberRole.Admin)
                        && w.Members.Any(m => m.UserId != id))
            .Select(w => w.Name)
            .ToListAsync();

        if (bloqueando.Count > 0)
            return new DeleteAccountResult(DeleteAccountStatus.AdminHasMembers, bloqueando);

        // O vínculo não sobrevive à conta: sem isso o titular continuaria
        // listado como participante de workspaces alheios.
        var vinculos = await db.WorkspaceMembers.Where(m => m.UserId == id).ToListAsync();
        db.WorkspaceMembers.RemoveRange(vinculos);

        // Workspaces em que o titular era o único participante deixam de ter
        // razão de existir, e seu diário seria inacessível a qualquer pessoa.
        // O Any antes do All não é redundante: All em coleção vazia é verdadeiro,
        // e sem ele um workspace sem nenhum participante seria apagado junto.
        var orfaos = await db.Workspaces
            .Where(w => w.Members.Any(m => m.UserId == id)
                        && w.Members.All(m => m.UserId == id))
            .ToListAsync();
        db.Workspaces.RemoveRange(orfaos);

        // As entradas e os registros de auditoria que sobrevivem têm a autoria
        // anulada pelo SetNull, e passam a ser exibidos como "Usuário removido"
        // (RN-014). O conteúdo pertence ao histórico de outra pessoa.
        db.Users.Remove(user);

        await db.SaveChangesAsync();

        return new DeleteAccountResult(DeleteAccountStatus.Deleted);
    }
}
