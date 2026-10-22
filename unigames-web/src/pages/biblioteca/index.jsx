import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import GameCard from '../../components/GameCard';
import {
  listarDesenvolvedoras,
  listarGeneros,
  listarJogos,
} from '../../services/api';
import BarraFiltros from '../../components/BarraFiltros';
import DetalhesJogo from '../../components/DetalhesJogo';
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

  return (
    <div className="library-page">

      <BarraFiltros
        filtros={filtros}
        generos={generos}
        desenvolvedoras={desenvolvedoras}
        onChange={handleFiltroChange}
        onLimpar={limparFiltros}
      />

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

      <div className="library-workspace">
      
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


        <DetalhesJogo
          jogo={jogoSelecionado}
          onEditar={(id) => navigate(`/jogos?editar=${id}`)}
        />
      </div>
    </div>
  );
}