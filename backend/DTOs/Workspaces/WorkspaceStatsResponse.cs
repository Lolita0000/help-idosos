namespace EloDeCuidado.DTOs;

/// <summary>
/// Números exibidos na tela de configuração do workspace.
/// </summary>
/// <param name="MemberCount">Quantidade de participantes.</param>
/// <param name="EntryCount">Quantidade de entradas no diário.</param>
public sealed record WorkspaceStatsResponse(int MemberCount, int EntryCount);
