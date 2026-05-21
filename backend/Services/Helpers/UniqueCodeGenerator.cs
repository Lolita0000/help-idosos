namespace EloDeCuidado.Services.Helpers;

public static class UniqueCodeGenerator
{
    /// <summary>
    /// Gera um código alfanumérico único de um determinado comprimento. O código é composto por letras maiúsculas e dígitos.
    /// </summary>
    /// <param name="length">O comprimento do código a ser gerado.</param>
    /// <returns>Um código alfanumérico único.</returns>
    public static string Generate(int length)
    {
        const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        var random = new Random();
        return new string(
            Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray()
        );
    }
}
