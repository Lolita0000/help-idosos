namespace EloDeCuidado.DTOs.InviteCode;

/// <summary>
/// Pedido de ingresso em um workspace por código de convite (HU-03).
/// O código é aceito com ou sem hífen e em qualquer caixa (ex.: "kho6-ny67").
/// </summary>
public sealed record JoinWithCodeRequest(string? Code);
