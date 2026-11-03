using EloDeCuidado.DTOs.Users;

namespace EloDeCuidado.Services.Helpers;

/// <summary>
/// Regras de validação dos dados pessoais.
/// </summary>
public static class ProfileRules
{
    /// <summary>Valores aceitos para gênero.</summary>
    public static readonly string[] Genders = ["feminino", "masculino", "outro", "nao_informar"];

    /// <summary>Limite do nome, igual ao da coluna.</summary>
    public const int NameMax = 256;

    private static readonly DateOnly Oldest = new(1900, 1, 1);

    /// <summary>Remove a máscara do telefone, deixando só os dígitos.</summary>
    public static string PhoneDigits(string phone) =>
        new(phone.Where(char.IsAsciiDigit).ToArray());

    /// <summary>
    /// Valida a alteração. Retorna a mensagem do primeiro problema, ou nulo.
    /// </summary>
    public static string? Validate(UpdateProfileRequest r, DateOnly today)
    {
        if (r.Name is not null && string.IsNullOrWhiteSpace(r.Name))
            return "Informe o nome completo.";

        if (r.Name?.Trim().Length > NameMax)
            return $"O nome aceita até {NameMax} caracteres.";

        if (!string.IsNullOrWhiteSpace(r.Phone))
        {
            // 10 dígitos é fixo, 11 é celular com o 9: DDD + número, sem o +55.
            var digits = PhoneDigits(r.Phone);
            if (digits.Length is not (10 or 11) || digits[0] == '0')
                return "Informe o telefone com DDD, por exemplo (61) 99999-0000.";
        }

        if (r.BirthDate is { } birth)
        {
            if (birth > today)
                return "A data de nascimento não pode estar no futuro.";
            if (birth < Oldest)
                return "Informe uma data de nascimento válida.";
        }

        if (!string.IsNullOrWhiteSpace(r.Gender) && !Genders.Contains(r.Gender.Trim()))
            return "Gênero inválido. Use feminino, masculino, outro ou nao_informar.";

        return null;
    }
}
