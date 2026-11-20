namespace EloDeCuidado.DTOs.InviteCode;

/// <summary>
/// DTO para criação de um código de convite.
/// </summary>
public class CreateInviteCodeRequest
{
    /// <summary>
    /// O workspace ao qual o código dá acesso. Obrigatório.
    /// </summary>
    public int WorkspaceId { get; set; }

    /// <summary>
    /// A data de expiração do código. Opcional. Quando não informada, o código
    /// expira em 24 horas, conforme a RN-005. Valores acima desse limite são
    /// ajustados para 24 horas.
    /// </summary>
    public DateTime? ExpiresAt { get; set; }

    /// <summary>
    /// Opcional. Quando verdadeiro, o código é para a pessoa acompanhada: quem
    /// entrar com ele já passa a ser marcada como tal, e o código só serve uma vez.
    /// </summary>
    public bool ForSubject { get; set; }
}
