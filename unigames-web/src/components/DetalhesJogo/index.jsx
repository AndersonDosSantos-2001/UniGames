import './styles.css';

export default function DetalhesJogo({ jogo, onEditar }) {
  function formatarPreco(valor) {
    if (Number(valor) === 0) return 'Gratuito para Jogar';
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
  }

  return (
    <aside className="game-details-subscreen">
      {jogo ? (
        <div className="details-card">
          <div className="details-hero">
            {jogo.imagem ? (
              <img
                src={jogo.imagem}
                alt={jogo.nome}
                className="details-banner"
              />
            ) : (
              <div className="details-banner-placeholder">
                <span className="material-icons">sports_esports</span>
              </div>
            )}
            <div className="details-hero-gradient" />
            <div className="details-hero-title">
              <span className="selected-badge">DETALHES DO JOGO</span>
              <h1>{jogo.nome}</h1>
            </div>
          </div>

          <div className="details-action-bar">
            <div className="play-box">
              <button
                type="button"
                className="btn-green btn-play-demo"
                onClick={() => onEditar(jogo.id)}
                title="Ir para o gerenciamento deste jogo"
              >
                <span className="material-icons icon-sm">settings</span>
                GERENCIAR / EDITAR
              </button>
            </div>
            <div className="price-stat">
              <span className="stat-label">PREÇO NA LOJA</span>
              <span className="stat-value price">
                {formatarPreco(jogo.preco)}
              </span>
            </div>
          </div>

          <div className="details-body">
            <div className="meta-grid">
              <div className="meta-item">
                <span className="meta-label">DESENVOLVEDORA</span>
                <span className="meta-value highlight">
                  {jogo.desenvolvedora?.nome || 'Não informada'}
                </span>
              </div>
              <div className="meta-item">
                <span className="meta-label">ANO DE LANÇAMENTO</span>
                <span className="meta-value">{jogo.ano_lancamento}</span>
              </div>
            </div>

            <div className="genres-section">
              <span className="meta-label">GÊNEROS / MARCADORES</span>
              <div className="genre-tags">
                {jogo.generos && jogo.generos.length > 0 ? (
                  jogo.generos.map((gen) => (
                    <span key={gen.id} className="genre-tag">
                      {gen.nome}
                    </span>
                  ))
                ) : (
                  <span className="genre-tag muted">Sem gênero vinculado</span>
                )}
              </div>
            </div>

            <div className="description-section">
              <h3>SOBRE ESTE JOGO</h3>
              <p>{jogo.descricao}</p>
            </div>
          </div>
        </div>
      ) : (
        <div className="details-empty">
          <span className="material-icons empty-select-icon">ads_click</span>
          <h3>Selecione um jogo na biblioteca</h3>
          <p>
            Clique em qualquer capa ao lado para visualizar a subtela com a
            sinopse completa, gêneros, desenvolvedora e preço.
          </p>
        </div>
      )}
    </aside>
  );
}