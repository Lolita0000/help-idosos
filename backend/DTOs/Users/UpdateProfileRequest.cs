namespace EloDeCuidado.DTOs.Users;

/// <summary>
/// Alteração parcial dos dados pessoais. Campo omitido não muda.
/// Para apagar telefone, nascimento ou gênero, envie texto vazio no telefone e
/// no gênero, e <c>clearBirthDate: true</c> no nascimento.
/// </summary>
/// <param name="Name">Novo nome completo.</param>
/// <param name="Phone">Telefone com ou sem máscara. Vazio apaga.</param>
/// <param name="BirthDate">Data de nascimento.</param>
/// <param name="ClearBirthDate">Verdadeiro para apagar a data de nascimento.</param>
/// <param name="Gender">feminino, masculino, outro ou nao_informar. Vazio apaga.</param>
public sealed record UpdateProfileRequest(
    string? Name,
    string? Phone,
    DateOnly? BirthDate,
    bool ClearBirthDate = false,
    string? Gender = null);
