import './styles.css';

export default function BarraFiltros({
  filtros,
  generos,
  desenvolvedoras,
  onChange,
  onLimpar,
}) {
  const temFiltroAtivo =
    filtros.nome ||
    filtros.generoId ||
    filtros.desenvolvedoraId ||
    filtros.anoLancamento;

  return (
    <section className="library-toolbar">
      <div className="search-box">
        <span className="material-icons search-icon">search</span>
        <input
          type="text"
          name="nome"
          placeholder="Buscar jogo pelo nome na biblioteca..."
          value={filtros.nome}
          onChange={onChange}
        />
      </div>

      <div className="filter-group">
        <select
          name="generoId"
          value={filtros.generoId}
          onChange={onChange}
        >
          <option value="">Todos os Gêneros</option>
          {generos.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nome}
            </option>
          ))}
        </select>

        <select
          name="desenvolvedoraId"
          value={filtros.desenvolvedoraId}
          onChange={onChange}
        >
          <option value="">Todas as Desenvolvedoras</option>
          {desenvolvedoras.map((d) => (
            <option key={d.id} value={d.id}>
              {d.nome}
            </option>
          ))}
        </select>

        <input
          type="number"
          name="anoLancamento"
          placeholder="Ano (ex: 2023)"
          className="year-filter"
          value={filtros.anoLancamento}
          onChange={onChange}
        />

        {temFiltroAtivo && (
          <button
            type="button"
            className="btn-secondary"
            onClick={onLimpar}
          >
            <span className="material-icons icon-sm">filter_alt_off</span>
            Limpar Filtros
          </button>
        )}
      </div>
    </section>
  );
}