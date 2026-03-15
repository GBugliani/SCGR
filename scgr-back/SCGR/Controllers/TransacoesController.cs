using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using SCGR.Data;
using SCGR.Models;

namespace SCGR.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class TransacoesController : ControllerBase
    {
        private readonly AppDbContext _context;

        public TransacoesController(AppDbContext context)
        {
            _context = context;
        }

        // Lista todas as transações cadastradas
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Transacao>>> GetTransacoes()
        {

            return await _context.Transacoes
                .Include(t => t.Pessoa)
                .Include(t => t.Categoria)
                .ToListAsync();
        }

        // Cria um novo registro de transação
        [HttpPost]
        public async Task<ActionResult<Transacao>> PostTransacao(Transacao transacao)
        {
            // Busca a entidade relacional na base de dados (Pessoa)
            var pessoa = await _context.Pessoas.FindAsync(transacao.PessoaId);
            if (pessoa == null)
            {
                return BadRequest("A pessoa informada não existe na base de dados.");
            }

            // Caso o usuário informe um menor de idade (menor de 18), apenas despesas deverão ser aceitas
            if (pessoa.Idade < 18 && transacao.Tipo != TipoTransacao.Despesa)
            {
                return UnprocessableEntity("Violação de regra: Pessoas menores de 18 anos só podem registrar transações do tipo Despesa.");
            }

            // Busca a entidade relacional na base de dados (Categoria)
            var categoria = await _context.Categorias.FindAsync(transacao.CategoriaId);
            if (categoria == null)
            {
                return BadRequest("A categoria informada não existe na base de dados.");
            }

            // Restringe a utilização de categorias conforme o valor definido no campo finalidade.
            // Ex.: se o tipo da transação é despesa, não poderá utilizar uma categoria que tenha a finalidade receita
            bool isCategoriaCompativel =
                (transacao.Tipo == TipoTransacao.Despesa && (categoria.Finalidade == FinalidadeCategoria.Despesa || categoria.Finalidade == FinalidadeCategoria.Ambas)) ||
                (transacao.Tipo == TipoTransacao.Receita && (categoria.Finalidade == FinalidadeCategoria.Receita || categoria.Finalidade == FinalidadeCategoria.Ambas));

            if (!isCategoriaCompativel)
            {
                return UnprocessableEntity("Violação de regra: A finalidade da categoria informada é incompatível com o tipo de transação.");
            }

            _context.Transacoes.Add(transacao);
            await _context.SaveChangesAsync();

            return Created($"/api/transacoes/{transacao.Id}", transacao);
        }
    }
}