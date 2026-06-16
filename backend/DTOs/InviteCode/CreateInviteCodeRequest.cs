namespace EloDeCuidado.DTOs.InviteCode;

/// <summary>
/// DTO para criação de um código de convite.
/// </summary>
public class CreateInviteCodeRequest
{
    /// <summary>
    /// O ID do workspace para o qual o código de convite será gerado.
    /// </summary>
    public int WorkspaceId { get; set; }

    /// <summary>
    /// A data de expiração do código de convite. Opcional. Se não for fornecida, o código de convite expirará em 7 dias a partir da data de criação.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }
}
