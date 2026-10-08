namespace EloDeCuidado.Services.Helpers;

/// <summary>
/// Responsável por gerar e verificar hashes de senha com BCrypt, e por validar
/// a força da senha conforme as regras definidas no design do produto.
/// </summary>
/// <remarks>
/// BCrypt é uma função de sentido único: a senha original não pode ser recuperada
/// a partir do hash. O <c>workFactor</c> define o custo computacional e, portanto,
/// a resistência a ataques de força bruta.
/// </remarks>
public static class PasswordHasher
{
    /// <summary>
    /// Custo do algoritmo. Cada incremento dobra o tempo de processamento.
    /// </summary>
    private const int WorkFactor = 12;

    /// <summary>
    /// Número mínimo de caracteres exigido pela política de senha.
    /// </summary>
    public const int MinimumLength = 8;

    /// <summary>
    /// Gera o hash BCrypt de uma senha em texto puro.
    /// </summary>
    /// <param name="password">A senha em texto puro.</param>
    /// <returns>O hash a ser persistido.</returns>
    public static string Hash(string password) =>
        BCrypt.Net.BCrypt.HashPassword(password, WorkFactor);

    /// <summary>
    /// Verifica se uma senha em texto puro corresponde a um hash.
    /// </summary>
    /// <param name="password">A senha informada pelo usuário.</param>
    /// <param name="hash">O hash armazenado.</param>
    /// <returns><c>true</c> se a senha corresponde ao hash.</returns>
    public static bool Verify(string password, string hash)
    {
        // Um hash malformado no banco não deve derrubar a requisição:
        // trata-se como credencial inválida.
        try
        {
            return BCrypt.Net.BCrypt.Verify(password, hash);
        }
        catch (BCrypt.Net.SaltParseException)
        {
            return false;
        }
    }

    /// <summary>
    /// Valida a força da senha conforme a política do produto: no mínimo
    /// <see cref="MinimumLength"/> caracteres, com ao menos uma letra maiúscula,
    /// uma minúscula, um número e um caractere especial.
    /// </summary>
    /// <param name="password">A senha a validar.</param>
    /// <param name="error">A mensagem de erro, quando a senha é inválida.</param>
    /// <returns><c>true</c> se a senha atende a todos os critérios.</returns>
    public static bool IsStrong(string? password, out string error)
    {
        if (string.IsNullOrWhiteSpace(password) || password.Length < MinimumLength)
        {
            error = $"A senha deve conter no mínimo {MinimumLength} caracteres.";
            return false;
        }

        if (!password.Any(char.IsUpper))
        {
            error = "A senha deve conter pelo menos uma letra maiúscula.";
            return false;
        }

        if (!password.Any(char.IsLower))
        {
            error = "A senha deve conter pelo menos uma letra minúscula.";
            return false;
        }

        if (!password.Any(char.IsDigit))
        {
            error = "A senha deve conter pelo menos um número.";
            return false;
        }

        if (password.All(char.IsLetterOrDigit))
        {
            error = "A senha deve conter pelo menos um caractere especial (ex: @, $, !, %, *, ?, &).";
            return false;
        }

        error = string.Empty;
        return true;
    }
}
