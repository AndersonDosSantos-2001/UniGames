import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../components/Modal';
import ModalEntidade from '../../components/ModalEntidade';
import TabelaJogos from '../../components/TabelaJogos';
import {
  atualizarDesenvolvedora,
  atualizarGenero,
  atualizarJogo,
  cadastrarDesenvolvedora,
  cadastrarGenero,
  cadastrarJogo,
  deletarDesenvolvedora,
  deletarGenero,
  deletarJogo,
  listarDesenvolvedoras,
  listarGeneros,
  listarJogos,
} from '../../services/api';
import './styles.css';

const ESTADO_INICIAL_FORM = {
  nome: '',
  preco: '',
  anoLancamento: new Date().getFullYear(),
  desenvolvedoraId: '',
  generos: [],
  descricao: '',
  imagem: null,
};

export default function JogosPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const fileInputRef = useRef(null);

  // Listas de dados da API
  const [jogos, setJogos] = useState([]);
  const [desenvolvedoras, setDesenvolvedoras] = useState([]);
  const [generos, setGeneros] = useState([]);

  // Estado do formulário de Jogo
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Feedback, carregamento e controle de abertura dos Modais
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvandoJogo, setSalvandoJogo] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [modalDevAberto, setModalDevAberto] = useState(false);
  const [modalGeneroAberto, setModalGeneroAberto] = useState(false);

  // Estado para confirmar a exclusão de um jogo no Modal
  const [jogoParaDeletar, setJogoParaDeletar] = useState(null);

  useEffect(() => {
    carregarTudo();
  }, []);

  useEffect(() => {
    const idEditar = searchParams.get('editar');
    if (idEditar && jogos.length > 0) {
      const jogoAlvo = jogos.find((j) => String(j.id) === String(idEditar));
      if (jogoAlvo) {
        iniciarEdicaoJogo(jogoAlvo);
        searchParams.delete('editar');
        setSearchParams(searchParams, { replace: true });
      }
    }
  }, [searchParams, jogos]);

  async function carregarTudo() {
    try {
      setCarregandoLista(true);
      const [listaJogos, listaDevs, listaGens] = await Promise.all([
        listarJogos(),
        listarDesenvolvedoras(),
        listarGeneros(),
      ]);
      setJogos(listaJogos || []);
      setDesenvolvedoras(listaDevs || []);
      setGeneros(listaGens || []);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Erro ao carregar dados do servidor.');
    } finally {
      setCarregandoLista(false);
    }
  }

  function exibirMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    window.scrollTo({ top: 0, behavior: 'smooth' });

    setTimeout(() => {
      setMensagem((atual) => (atual.texto === texto ? { tipo: '', texto: '' } : atual));
    }, 5000);
  }

  // HANDLERS DO FORMULÁRIO DE JOGO
  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  function handleToggleGenero(generoId) {
    const idNum = Number(generoId);
    setForm((prev) => {
      const jaSelecionado = prev.generos.includes(idNum);
      const novosGeneros = jaSelecionado
        ? prev.generos.filter((id) => id !== idNum)
        : [...prev.generos, idNum];
      return { ...prev, generos: novosGeneros };
    });
  }

  function handleImagemChange(e) {
    const arquivo = e.target.files?.[0];
    if (arquivo) {
      setForm((prev) => ({ ...prev, imagem: arquivo }));
      setPreviewUrl(URL.createObjectURL(arquivo));
    }
  }

  function limparFormularioJogo() {
    setForm(ESTADO_INICIAL_FORM);
    setEditandoId(null);
    setPreviewUrl('');
    if (fileInputRef.current) fileInputRef.current.value = '';
  }

  function iniciarEdicaoJogo(jogo) {
    setEditandoId(jogo.id);
    setForm({
      nome: jogo.nome || '',
      preco: jogo.preco ?? '',
      anoLancamento: jogo.ano_lancamento || new Date().getFullYear(),
      desenvolvedoraId: jogo.desenvolvedora?.id || jogo.desenvolvedora_id || '',
      generos: jogo.generos ? jogo.generos.map((g) => Number(g.id)) : [],
      descricao: jogo.descricao || '',
      imagem: null,
    });
    setPreviewUrl(jogo.imagem || '');
    if (fileInputRef.current) fileInputRef.current.value = '';
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmitJogo(e) {
    e.preventDefault();

    // VALIDAÇÃO DE CAMPOS OBRIGATÓRIOS
    if (!form.nome.trim()) {
      exibirMensagem('erro', 'O campo "Nome do Jogo" é obrigatório.');
      return;
    }

    if (form.preco === '' || isNaN(Number(form.preco)) || Number(form.preco) < 0) {
      exibirMensagem('erro', 'Informe um preço válido (maior ou igual a zero).');
      return;
    }

    const ano = Number(form.anoLancamento);
    if (!form.anoLancamento || isNaN(ano) || ano < 1970 || ano > 2026) {
      exibirMensagem('erro', 'Informe um Ano de Lançamento válido (entre 1970 e 2026).');
      return;
    }

    if (!form.desenvolvedoraId) {
      exibirMensagem('erro', 'Selecione uma desenvolvedora para o jogo.');
      return;
    }

    if (!form.generos || form.generos.length === 0) {
      exibirMensagem('erro', 'Selecione pelo menos um gênero para o jogo.');
      return;
    }

    if (!form.descricao.trim()) {
      exibirMensagem('erro', 'O campo "Descrição / Sinopse" é obrigatório.');
      return;
    }

    if (!editandoId && !form.imagem) {
      exibirMensagem('erro', 'Por favor, selecione uma imagem de capa para cadastrar o jogo.');
      return;
    }

    try {
      setSalvandoJogo(true);
      if (editandoId) {
        await atualizarJogo(editandoId, form);
        exibirMensagem('sucesso', `Jogo "${form.nome}" atualizado com sucesso!`);
      } else {
        await cadastrarJogo(form);
        exibirMensagem('sucesso', `Jogo "${form.nome}" cadastrado com sucesso!`);
      }
      limparFormularioJogo();
      setJogos((await listarJogos()) || []);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Erro ao salvar o jogo.');
    } finally {
      setSalvandoJogo(false);
    }
  }

  async function confirmarDeletarJogo() {
    if (!jogoParaDeletar) return;
    try {
      await deletarJogo(jogoParaDeletar.id);
      if (editandoId === jogoParaDeletar.id) limparFormularioJogo();
      exibirMensagem('sucesso', `Jogo "${jogoParaDeletar.nome}" removido com sucesso!`);
      setJogos((await listarJogos()) || []);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Não foi possível excluir o jogo.');
    } finally {
      setJogoParaDeletar(null);
    }
  }

  // HANDLERS DE DESENVOLVEDORA E GÊNERO (Erros e confirmações tratados no ModalEntidade)
  async function handleSalvarDesenvolvedora(nome, idEdicao) {
    if (idEdicao) {
      await atualizarDesenvolvedora(idEdicao, nome);
    } else {
      const nova = await cadastrarDesenvolvedora(nome);
      if (nova?.id) setForm((prev) => ({ ...prev, desenvolvedoraId: nova.id }));
    }
    setDesenvolvedoras((await listarDesenvolvedoras()) || []);
  }

  async function handleDeletarDesenvolvedora(dev) {
    await deletarDesenvolvedora(dev.id);
    setDesenvolvedoras((await listarDesenvolvedoras()) || []);
    if (String(form.desenvolvedoraId) === String(dev.id)) {
      setForm((prev) => ({ ...prev, desenvolvedoraId: '' }));
    }
  }

  async function handleSalvarGenero(nome, idEdicao) {
    if (idEdicao) {
      await atualizarGenero(idEdicao, nome);
    } else {
      const novo = await cadastrarGenero(nome);
      if (novo?.id) {
        setForm((prev) => ({ ...prev, generos: [...prev.generos, Number(novo.id)] }));
      }
    }
    setGeneros((await listarGeneros()) || []);
  }

  async function handleDeletarGenero(gen) {
    await deletarGenero(gen.id);
    setGeneros((await listarGeneros()) || []);
    setForm((prev) => ({
      ...prev,
      generos: prev.generos.filter((id) => id !== Number(gen.id)),
    }));
  }

  return (
    <div className="jogos-page">
      {mensagem.texto && (
        <div className={`feedback-banner ${mensagem.tipo}`}>
          <span className="feedback-text-content">
            <span className="material-icons icon-md">
              {mensagem.tipo === 'sucesso' ? 'check_circle' : 'error_outline'}
            </span>
            {mensagem.texto}
          </span>
          <button
            type="button"
            onClick={() => setMensagem({ tipo: '', texto: '' })}
            title="Fechar aviso"
          >
            <span className="material-icons icon-sm">close</span>
          </button>
        </div>
      )}

      {/* FORMULÁRIO DE CADASTRO E EDIÇÃO DE JOGO */}
      <section className="panel-box">
        <div className="panel-header">
          <div>
            <h2>
              <span className="material-icons panel-title-icon">
                {editandoId ? 'edit_note' : 'add_box'}
              </span>
              {editandoId ? `EDITANDO JOGO #${editandoId}` : 'CADASTRAR NOVO JOGO'}
            </h2>
            <p>Preencha as informações abaixo para adicionar ou atualizar um jogo no catálogo.</p>
          </div>
        </div>

        <form className="game-form" onSubmit={handleSubmitJogo} noValidate>
          <div className="form-grid">
            <div className="form-fields">
              <div className="form-group">
                <label htmlFor="nome">Nome do Jogo *</label>
                <input
                  id="nome"
                  name="nome"
                  type="text"
                  required
                  placeholder="Ex: Elden Ring, GTA V, Hades..."
                  value={form.nome}
                  onChange={handleChange}
                />
              </div>

              <div className="form-row-2">
                <div className="form-group">
                  <label htmlFor="preco">Preço (R$) *</label>
                  <input
                    id="preco"
                    name="preco"
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    placeholder="Ex: 199.90"
                    value={form.preco}
                    onChange={handleChange}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="anoLancamento">Ano de Lançamento *</label>
                  <input
                    id="anoLancamento"
                    name="anoLancamento"
                    type="number"
                    min="1970"
                    max="2026"
                    required
                    value={form.anoLancamento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="desenvolvedoraId">Desenvolvedora *</label>
                  <button
                    type="button"
                    className="btn-inline-modal"
                    onClick={() => setModalDevAberto(true)}
                  >
                    <span className="material-icons icon-sm">domain_add</span>
                    Nova / Gerenciar Desenvolvedoras
                  </button>
                </div>
                <select
                  id="desenvolvedoraId"
                  name="desenvolvedoraId"
                  required
                  value={form.desenvolvedoraId}
                  onChange={handleChange}
                >
                  <option value="">Selecione uma desenvolvedora...</option>
                  {desenvolvedoras.map((dev) => (
                    <option key={dev.id} value={dev.id}>
                      {dev.nome}
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <div className="label-with-action">
                  <label>Gêneros do Jogo *</label>
                  <button
                    type="button"
                    className="btn-inline-modal"
                    onClick={() => setModalGeneroAberto(true)}
                  >
                    <span className="material-icons icon-sm">sell</span>
                    Novo / Gerenciar Gêneros
                  </button>
                </div>
                <div className="checkbox-pills">
                  {generos.length === 0 ? (
                    <span className="muted-hint">
                      Nenhum gênero cadastrado. Clique acima para criar.
                    </span>
                  ) : (
                    generos.map((gen) => {
                      const ativo = form.generos.includes(Number(gen.id));
                      return (
                        <button
                          key={gen.id}
                          type="button"
                          className={`genre-pill ${ativo ? 'active' : ''}`}
                          onClick={() => handleToggleGenero(gen.id)}
                        >
                          <span className="material-icons pill-icon">
                            {ativo ? 'check' : 'add'}
                          </span>
                          {gen.nome}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="descricao">Descrição / Sinopse *</label>
                <textarea
                  id="descricao"
                  name="descricao"
                  rows="4"
                  required
                  placeholder="Descreva a história, jogabilidade e recursos do jogo..."
                  value={form.descricao}
                  onChange={handleChange}
                />
              </div>
            </div>

            <div className="form-upload">
              <label>Imagem de Capa (recomendado: 1280 x 600 pixels) *</label>
              <div
                className="cover-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                {previewUrl ? (
                  <img src={previewUrl} alt="Preview da capa" />
                ) : (
                  <div className="dropzone-placeholder">
                    <span className="material-icons upload-icon">add_photo_alternate</span>
                    <p>Clique para selecionar uma imagem</p>
                    <small>JPG, PNG ou WEBP (Máx. 5MB)</small>
                  </div>
                )}
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImagemChange}
                style={{ display: 'none' }}
              />
              {previewUrl && (
                <button
                  type="button"
                  className="btn-secondary btn-full"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <span className="material-icons icon-sm">autorenew</span>
                  Trocar Imagem de Capa
                </button>
              )}
            </div>
          </div>

          <div className="form-footer">
            {editandoId && (
              <button type="button" className="btn-secondary" onClick={limparFormularioJogo}>
                <span className="material-icons icon-sm">clear_all</span>
                Limpar / Cancelar
              </button>
            )}
            <button
              type="submit"
              className={editandoId ? 'btn-green' : 'btn-primary'}
              disabled={salvandoJogo}
            >
              <span className="material-icons icon-sm">
                {salvandoJogo ? 'hourglass_top' : editandoId ? 'save' : 'rocket_launch'}
              </span>
              {salvandoJogo
                ? 'Salvando...'
                : editandoId
                ? 'Salvar Alterações'
                : 'Cadastrar Jogo'}
            </button>
          </div>
        </form>
      </section>

      {/* TABELA DE JOGOS */}
      <TabelaJogos
        jogos={jogos}
        carregandoLista={carregandoLista}
        editandoId={editandoId}
        onEditar={iniciarEdicaoJogo}
        onDeletar={(jogo) => setJogoParaDeletar(jogo)}
      />

      {/* MODAL DE CONFIRMAÇÃO DE EXCLUSÃO DE JOGO */}
      <Modal
        isOpen={Boolean(jogoParaDeletar)}
        onClose={() => setJogoParaDeletar(null)}
        title={
          <>
            <span className="material-icons">warning_amber</span>
            Confirmar Exclusão
          </>
        }
      >
        <p style={{ color: 'var(--text-main)', lineHeight: 1.5 }}>
          Tem certeza que deseja excluir o jogo{' '}
          <strong style={{ color: 'var(--text-bright)' }}>
            "{jogoParaDeletar?.nome}"
          </strong>
          ?
        </p>
        <div className="form-footer">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setJogoParaDeletar(null)}
          >
            Cancelar
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={confirmarDeletarJogo}
          >
            Confirmar Exclusão
          </button>
        </div>
      </Modal>

      {/* MODAL DE DESENVOLVEDORAS */}
      <ModalEntidade
        isOpen={modalDevAberto}
        onClose={() => setModalDevAberto(false)}
        titulo="Gerenciar Desenvolvedoras"
        icone="business"
        placeholder="Nome da desenvolvedora (ex: Rockstar Games)"
        itens={desenvolvedoras}
        onSalvar={handleSalvarDesenvolvedora}
        onDeletar={handleDeletarDesenvolvedora}
      />

      {/* MODAL DE GÊNEROS */}
      <ModalEntidade
        isOpen={modalGeneroAberto}
        onClose={() => setModalGeneroAberto(false)}
        titulo="Gerenciar Gêneros"
        icone="local_offer"
        placeholder="Nome do gênero (ex: Terror, Corrida, RPG)"
        itens={generos}
        onSalvar={handleSalvarGenero}
        onDeletar={handleDeletarGenero}
      />
    </div>
  );
}