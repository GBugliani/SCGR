using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCGR.Data;
using SCGR.Models;
using SCGR.Reports;

namespace SCGR.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PessoasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public PessoasController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todas as pessoas cadastradas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Pessoa>>> GetPessoas()
        {
            return await _context.Pessoas.ToListAsync();
        }

        // Cria um novo registro de pessoa
        [HttpPost]
        public async Task<ActionResult<Pessoa>> PostPessoa(Pessoa pessoa)
        {
            _context.Pessoas.Add(pessoa);
            await _context.SaveChangesAsync();

            return Created($"/api/pessoas/{pessoa.Id}", pessoa);
        }

        [HttpPut("{id}")]
        public async Task<IActionResult> PutPessoa(int id, Pessoa pessoaAtualizada)
        {
            if (id != pessoaAtualizada.Id)
            {
                return BadRequest();
            }

            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null)
            {
                return NotFound();
            }

            pessoa.Nome = pessoaAtualizada.Nome;
            pessoa.Idade = pessoaAtualizada.Idade;

            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Deleta uma pessoa, a exclusão das transações associadas ocorrerá automaticamente
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeletePessoa(int id)
        {
            var pessoa = await _context.Pessoas.FindAsync(id);
            if (pessoa == null)
            {
                return NotFound();
            }

            // A lógica de exclusão em cascata (deletar transações da pessoa) não precisa ser feita manualmente aqui,
            // pois foi delegada a um mecanismo no AppDbContext (DeleteBehavior.Cascade)
            _context.Pessoas.Remove(pessoa);
            await _context.SaveChangesAsync();

            return NoContent();
        }

        // Retorna o relatório de totais por pessoa e o totalizador geral absoluto da base
        [HttpGet("totais")]
        public async Task<ActionResult<RelatorioPessoasDto>> GetTotaisPorPessoa()
        {
            var relatorioPessoas = await _context.Pessoas
                .Select(p => new TotaisPessoaDto(
                    p.Id,
                    p.Nome,
                    p.Transacoes.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                    p.Transacoes.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor),
                    0m
                ))
                .ToListAsync();

            var detalhesPessoas = relatorioPessoas
                .Select(pessoa => pessoa with { Saldo = pessoa.TotalReceitas - pessoa.TotalDespesas })
                .ToList();

            var totalGeral = RelatorioHelper.CalcularTotaisGerais(
                detalhesPessoas,
                pessoa => pessoa.TotalReceitas,
                pessoa => pessoa.TotalDespesas);

            return Ok(new RelatorioPessoasDto(detalhesPessoas, totalGeral));
        }
    }
}
