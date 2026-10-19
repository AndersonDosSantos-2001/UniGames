import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../../components/GameCard';
import {
  listarDesenvolvedoras,
  listarGeneros,
  listarJogos,
} from '../../services/api';
import './styles.css';

export default function BibliotecaPage() {
  const navigate = useNavigate();

  const [jogos, setJogos] = useState([]);
  const [generos, setGeneros] = useState([]);
  const [desenvolvedoras, setDesenvolvedoras] = useState([]);
  const [jogoSelecionado, setJogoSelecionado] = useState(null);

  const [filtros, setFiltros] = useState({
    nome: '',
    generoId: '',
    desenvolvedoraId: '',
    anoLancamento: '',
  });

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState('');

  useEffect(() => {
    carregarDadosAuxiliares();
    carregarJogos();
  }, []);

  async function carregarDadosAuxiliares() {
    try {
      const [listaGen, listaDev] = await Promise.all([
        listarGeneros(),
        listarDesenvolvedoras(),
      ]);
      setGeneros(listaGen || []);
      setDesenvolvedoras(listaDev || []);
    } catch (err) {
      console.error('Erro ao carregar filtros:', err);
    }
  }

  async function carregarJogos(filtrosAtuais = filtros) {
    try {
      setCarregando(true);
      setErro('');
      const lista = await listarJogos(filtrosAtuais);
      setJogos(lista || []);

      if (lista && lista.length > 0) {
        const aindaExiste = jogoSelecionado
          ? lista.find((j) => j.id === jogoSelecionado.id)
          : null;
        setJogoSelecionado(aindaExiste || lista[0]);
      } else {
        setJogoSelecionado(null);
      }
    } catch (err) {
      setErro(err.message || 'Não foi possível carregar a biblioteca de jogos.');
    } finally {
      setCarregando(false);
    }
  }

  function handleFiltroChange(e) {
    const { name, value } = e.target;
    const novosFiltros = { ...filtros, [name]: value };
    setFiltros(novosFiltros);
    carregarJogos(novosFiltros);
  }

  function limparFiltros() {
    const filtrosLimpos = {
      nome: '',
      generoId: '',
      desenvolvedoraId: '',
      anoLancamento: '',
    };
    setFiltros(filtrosLimpos);
    carregarJogos(filtrosLimpos);
  }

  function formatarPreco(valor) {
    if (Number(valor) === 0) return 'Gratuito para Jogar';
    return `R$ ${Number(valor).toFixed(2).replace('.', ',')}`;
  }

  return (
    <div className="library-page">
      {/* Barra de Filtros e Pesquisa Superior */}
      <section className="library-toolbar">
        <div className="search-box">
          <span className="material-icons search-icon">search</span>
          <input
            type="text"
            name="nome"
            placeholder="Buscar jogo pelo nome na biblioteca..."
            value={filtros.nome}
            onChange={handleFiltroChange}
          />
        </div>

        <div className="filter-group">
          <select
            name="generoId"
            value={filtros.generoId}
            onChange={handleFiltroChange}
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
            onChange={handleFiltroChange}
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
            onChange={handleFiltroChange}
          />

          {(filtros.nome ||
            filtros.generoId ||
            filtros.desenvolvedoraId ||
            filtros.anoLancamento) && (
            <button
              type="button"
              className="btn-secondary"
              onClick={limparFiltros}
            >
              <span className="material-icons icon-sm">filter_alt_off</span>
              Limpar Filtros
            </button>
          )}
        </div>
      </section>

      {erro && (
        <div className="alert-error">
          <span className="alert-text-icon">
            <span className="material-icons icon-md">warning_amber</span>
            {erro}
          </span>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => carregarJogos()}
          >
            <span className="material-icons icon-sm">refresh</span>
            Tentar Novamente
          </button>
        </div>
      )}

      {/*  Subtela de Detalhes */}
      <div className="library-workspace">
        {/* Coluna Esquerda Catálogo e Grade de Capas */}
        <div className="library-catalog">
          <div className="section-header">
            <h2>
              <span className="material-icons section-title-icon">grid_view</span>
              TODOS OS JOGOS <span className="count-badge">({jogos.length})</span>
            </h2>
            <button
              type="button"
              className="btn-primary"
              onClick={() => navigate('/jogos')}
            >
              <span className="material-icons icon-sm">add_circle</span>
              Cadastrar Novo Jogo
            </button>
          </div>

          {carregando ? (
            <div className="loading-state">
              <div className="loading-spinner"></div>
              <p>Carregando sua biblioteca de jogos...</p>
            </div>
          ) : jogos.length === 0 ? (
            <div className="empty-state">
              <span className="material-icons empty-icon">folder_open</span>
              <h3>Nenhum jogo encontrado</h3>
              <p>
                Não encontramos jogos com os filtros atuais ou sua biblioteca ainda está vazia.
              </p>
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/jogos')}
              >
                <span className="material-icons icon-sm">add</span>
                Cadastrar Primeiro Jogo
              </button>
            </div>
          ) : (
            <div className="games-grid">
              {jogos.map((jogo) => (
                <GameCard
                  key={jogo.id}
                  jogo={jogo}
                  selecionado={jogoSelecionado?.id === jogo.id}
                  onSelect={(j) => setJogoSelecionado(j)}
                />
              ))}
            </div>
          )}
        </div>

        {/* Coluna Direita Subtela de Detalhes do Jogo Selecionado */}
        <aside className="game-details-subscreen">
          {jogoSelecionado ? (
            <div className="details-card">
              <div className="details-hero">
                {jogoSelecionado.imagem ? (
                  <img
                    src={jogoSelecionado.imagem}
                    alt={jogoSelecionado.nome}
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
                  <h1>{jogoSelecionado.nome}</h1>
                </div>
              </div>

              <div className="details-action-bar">
                <div className="play-box">
                  <button
                    type="button"
                    className="btn-green btn-play-demo"
                    onClick={() =>
                      navigate(`/jogos?editar=${jogoSelecionado.id}`)
                    }
                    title="Ir para o gerenciamento deste jogo"
                  >
                    <span className="material-icons icon-sm">settings</span>
                    GERENCIAR / EDITAR
                  </button>
                </div>
                <div className="price-stat">
                  <span className="stat-label">PREÇO NA LOJA</span>
                  <span className="stat-value price">
                    {formatarPreco(jogoSelecionado.preco)}
                  </span>
                </div>
              </div>

              <div className="details-body">
                <div className="meta-grid">
                  <div className="meta-item">
                    <span className="meta-label">DESENVOLVEDORA</span>
                    <span className="meta-value highlight">
                      {jogoSelecionado.desenvolvedora?.nome || 'Não informada'}
                    </span>
                  </div>
                  <div className="meta-item">
                    <span className="meta-label">ANO DE LANÇAMENTO</span>
                    <span className="meta-value">
                      {jogoSelecionado.ano_lancamento}
                    </span>
                  </div>
                </div>

                <div className="genres-section">
                  <span className="meta-label">GÊNEROS / MARCADORES</span>
                  <div className="genre-tags">
                    {jogoSelecionado.generos &&
                    jogoSelecionado.generos.length > 0 ? (
                      jogoSelecionado.generos.map((gen) => (
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
                  <p>{jogoSelecionado.descricao}</p>
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
      </div>
    </div>
  );
}
