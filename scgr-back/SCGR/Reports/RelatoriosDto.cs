namespace SCGR.Reports
{
    public sealed record TotaisGeraisDto(decimal TotalReceitas, decimal TotalDespesas, decimal SaldoLiquido);

    public sealed record TotaisPessoaDto(int PessoaId, string Nome, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

    public sealed record RelatorioPessoasDto(IReadOnlyList<TotaisPessoaDto> Pessoas, TotaisGeraisDto TotalGeral);

    public sealed record TotaisCategoriaDto(int CategoriaId, string Descricao, decimal TotalReceitas, decimal TotalDespesas, decimal Saldo);

    public sealed record RelatorioCategoriasDto(IReadOnlyList<TotaisCategoriaDto> Categorias, TotaisGeraisDto TotalGeral);

    public static class RelatorioHelper
    {
        public static TotaisGeraisDto CalcularTotaisGerais<T>(IEnumerable<T> itens, Func<T, decimal> receitasSelector, Func<T, decimal> despesasSelector)
        {
            var totalReceitas = itens.Sum(receitasSelector);
            var totalDespesas = itens.Sum(despesasSelector);

            return new TotaisGeraisDto(totalReceitas, totalDespesas, totalReceitas - totalDespesas);
        }
    }
}