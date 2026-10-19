import './styles.css';

export default function GameCard({ jogo, selecionado, onSelect }) {
  const precoFormatado = Number(jogo.preco) === 0
    ? 'Gratuito'
    : `R$ ${Number(jogo.preco).toFixed(2).replace('.', ',')}`;

  return (
    <div
      className={`game-card ${selecionado ? 'selected' : ''}`}
      onClick={() => onSelect(jogo)}
    >
      <div className="game-card-poster">
        {jogo.imagem ? (
          <img src={jogo.imagem} alt={jogo.nome} loading="lazy" />
        ) : (
          <div className="game-card-placeholder">
            <span className="material-icons">sports_esports</span>
            <small>Sem Capa</small>
          </div>
        )}
        <div className="game-card-overlay">
          <span className="game-card-price">{precoFormatado}</span>
        </div>
      </div>

      <div className="game-card-info">
        <h4 className="game-card-title" title={jogo.nome}>
          {jogo.nome}
        </h4>
        <span className="game-card-dev">
          {jogo.desenvolvedora?.nome || 'Desenvolvedora N/A'} • {jogo.ano_lancamento}
        </span>
      </div>
    </div>
  );
}
