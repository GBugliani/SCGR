using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCGR.Data;
using SCGR.Models;
using SCGR.Reports;

namespace SCGR.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CategoriasController : ControllerBase
    {
        private readonly AppDbContext _context;

        public CategoriasController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todas as categorias cadastradas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Categoria>>> GetCategorias()
        {
            return await _context.Categorias.ToListAsync();
        }

        // Cria um novo registro de categoria
        [HttpPost]
        public async Task<ActionResult<Categoria>> PostCategoria(Categoria categoria)
        {
            _context.Categorias.Add(categoria);
            await _context.SaveChangesAsync();

            return Created($"/api/categorias/{categoria.Id}", categoria);
        }

        [HttpGet("totais")]
        public async Task<ActionResult<RelatorioCategoriasDto>> GetTotaisPorCategoria()
        {
            var relatorioCategorias = await _context.Categorias
                .Select(c => new TotaisCategoriaDto(
                    c.Id,
                    c.Descricao,
                    c.Transacoes.Where(t => t.Tipo == TipoTransacao.Receita).Sum(t => t.Valor),
                    c.Transacoes.Where(t => t.Tipo == TipoTransacao.Despesa).Sum(t => t.Valor),
                    0m
                ))
                .ToListAsync();

            var detalhesCategorias = relatorioCategorias
                .Select(categoria => categoria with { Saldo = categoria.TotalReceitas - categoria.TotalDespesas })
                .ToList();

            var totalGeral = RelatorioHelper.CalcularTotaisGerais(
                detalhesCategorias,
                categoria => categoria.TotalReceitas,
                categoria => categoria.TotalDespesas);

            return Ok(new RelatorioCategoriasDto(detalhesCategorias, totalGeral));
        }
    }
}
