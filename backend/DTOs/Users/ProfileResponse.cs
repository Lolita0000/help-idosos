namespace EloDeCuidado.DTOs.Users;

/// <summary>
/// Dados pessoais da própria conta. Só são devolvidos ao titular: telefone,
/// nascimento e gênero não aparecem nas respostas de outros endpoints.
/// </summary>
/// <param name="Id">Identificador da conta.</param>
/// <param name="Name">Nome completo.</param>
/// <param name="Email">E-mail de acesso.</param>
/// <param name="Phone">Telefone somente com dígitos, ou nulo.</param>
/// <param name="BirthDate">Data de nascimento, ou nulo.</param>
/// <param name="Gender">Gênero informado, ou nulo.</param>
/// <param name="CreatedAt">Momento do cadastro.</param>
public sealed record ProfileResponse(
    int Id,
    string Name,
    string Email,
    string? Phone,
    DateOnly? BirthDate,
    string? Gender,
    DateTime CreatedAt);
