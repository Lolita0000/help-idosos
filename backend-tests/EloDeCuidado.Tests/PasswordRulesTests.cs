using EloDeCuidado.Services.Helpers;

namespace EloDeCuidado.Tests;

public class PasswordRulesTests
{
    [Theory]
    [InlineData("Abcdef1!")]
    [InlineData("Abcdefghijklmnopqrstu1!x")]
    public void IsStrong_DeveAceitar_NosLimitesDoIntervalo(string senha)
    {
        Assert.True(PasswordHasher.IsStrong(senha, out var erro));
        Assert.Empty(erro);
    }

    [Fact]
    public void IsStrong_DeveRecusar_SenhaCurta()
    {
        Assert.False(PasswordHasher.IsStrong("Abc1!xy", out var erro));
        Assert.Contains("mínimo 8", erro);
    }

    [Fact]
    public void IsStrong_DeveRecusar_SenhaLongaDemais_ComMensagemClara()
    {
        var senha = "Abcdefghijklmnopqrstuv1!x";

        Assert.Equal(25, senha.Length);
        Assert.False(PasswordHasher.IsStrong(senha, out var erro));
        Assert.Contains("máximo 24", erro);
    }

    [Fact]
    public void Hash_NaoDeveGuardarASenhaEmTextoPuro_EDeveVerificar()
    {
        var hash = PasswordHasher.Hash("Abcdef1!");

        Assert.DoesNotContain("Abcdef1!", hash);
        Assert.StartsWith("$2", hash);
        Assert.True(PasswordHasher.Verify("Abcdef1!", hash));
        Assert.False(PasswordHasher.Verify("Outra1!xx", hash));
    }
}
