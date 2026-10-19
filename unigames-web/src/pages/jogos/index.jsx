import { useEffect, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import Modal from '../../components/Modal';
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

  // Estado do formulário de Jogo (Cadastro / Edição)
  const [form, setForm] = useState(ESTADO_INICIAL_FORM);
  const [editandoId, setEditandoId] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  // Feedback e carregamento
  const [carregandoLista, setCarregandoLista] = useState(true);
  const [salvandoJogo, setSalvandoJogo] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });

  // Estados do Modal de Desenvolvedora
  const [modalDevAberto, setModalDevAberto] = useState(false);
  const [nomeDev, setNomeDev] = useState('');
  const [editandoDevId, setEditandoDevId] = useState(null);
  const [salvandoDev, setSalvandoDev] = useState(false);

  // Estados do Modal de Gênero
  const [modalGeneroAberto, setModalGeneroAberto] = useState(false);
  const [nomeGenero, setNomeGenero] = useState('');
  const [editandoGeneroId, setEditandoGeneroId] = useState(null);
  const [salvandoGenero, setSalvandoGenero] = useState(false);

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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handleSubmitJogo(e) {
    e.preventDefault();

    if (!form.desenvolvedoraId) {
      exibirMensagem('erro', 'Selecione uma desenvolvedora para o jogo.');
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
      const listaAtualizada = await listarJogos();
      setJogos(listaAtualizada || []);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Erro ao salvar o jogo.');
    } finally {
      setSalvandoJogo(false);
    }
  }

  async function handleDeletarJogo(jogo) {
    const confirmar = window.confirm(
      `Tem certeza que deseja excluir o jogo "${jogo.nome}"?`
    );
    if (!confirmar) return;

    try {
      await deletarJogo(jogo.id);
      if (editandoId === jogo.id) {
        limparFormularioJogo();
      }
      exibirMensagem('sucesso', `Jogo "${jogo.nome}" removido com sucesso!`);
      const listaAtualizada = await listarJogos();
      setJogos(listaAtualizada || []);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Erro ao excluir jogo.');
    }
  }


  // HANDLERS DO MODAL DE DESENVOLVEDORA
  async function handleSalvarDesenvolvedora(e) {
    e.preventDefault();
    if (!nomeDev.trim()) return;

    try {
      setSalvandoDev(true);
      if (editandoDevId) {
        await atualizarDesenvolvedora(editandoDevId, nomeDev.trim());
      } else {
        const nova = await cadastrarDesenvolvedora(nomeDev.trim());
        if (nova?.id) {
          setForm((prev) => ({ ...prev, desenvolvedoraId: nova.id }));
        }
      }
      setNomeDev('');
      setEditandoDevId(null);
      const listaDevs = await listarDesenvolvedoras();
      setDesenvolvedoras(listaDevs || []);
    } catch (err) {
      alert(err.message || 'Erro ao salvar desenvolvedora.');
    } finally {
      setSalvandoDev(false);
    }
  }

  async function handleDeletarDesenvolvedora(dev) {
    if (!window.confirm(`Deseja apagar a desenvolvedora "${dev.nome}"?`)) return;
    try {
      await deletarDesenvolvedora(dev.id);
      const listaDevs = await listarDesenvolvedoras();
      setDesenvolvedoras(listaDevs || []);
      if (String(form.desenvolvedoraId) === String(dev.id)) {
        setForm((prev) => ({ ...prev, desenvolvedoraId: '' }));
      }
    } catch (err) {
      alert(err.message || 'Erro ao excluir desenvolvedora.');
    }
  }


  // HANDLERS DO MODAL DE GÊNERO
  async function handleSalvarGenero(e) {
    e.preventDefault();
    if (!nomeGenero.trim()) return;

    try {
      setSalvandoGenero(true);
      if (editandoGeneroId) {
        await atualizarGenero(editandoGeneroId, nomeGenero.trim());
      } else {
        const novo = await cadastrarGenero(nomeGenero.trim());
        if (novo?.id) {
          setForm((prev) => ({
            ...prev,
            generos: [...prev.generos, Number(novo.id)],
          }));
        }
      }
      setNomeGenero('');
      setEditandoGeneroId(null);
      const listaGens = await listarGeneros();
      setGeneros(listaGens || []);
    } catch (err) {
      alert(err.message || 'Erro ao salvar gênero.');
    } finally {
      setSalvandoGenero(false);
    }
  }

  async function handleDeletarGenero(gen) {
    if (!window.confirm(`Deseja apagar o gênero "${gen.nome}"?`)) return;
    try {
      await deletarGenero(gen.id);
      const listaGens = await listarGeneros();
      setGeneros(listaGens || []);
      setForm((prev) => ({
        ...prev,
        generos: prev.generos.filter((id) => id !== Number(gen.id)),
      }));
    } catch (err) {
      alert(err.message || 'Erro ao excluir gênero.');
    }
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
              {editandoId
                ? `EDITANDO JOGO #${editandoId}`
                : 'CADASTRAR NOVO JOGO'}
            </h2>
            <p>
              Preencha as informações abaixo para adicionar ou atualizar um jogo no catálogo.
            </p>
          </div>
          {editandoId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={limparFormularioJogo}
            >
              <span className="material-icons icon-sm">close</span>
              Cancelar Edição
            </button>
          )}
        </div>

        <form className="game-form" onSubmit={handleSubmitJogo}>
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
                    max="2099"
                    required
                    value={form.anoLancamento}
                    onChange={handleChange}
                  />
                </div>
              </div>

              {/* Seleção de Desenvolvedora com botão de abrir Modal */}
              <div className="form-group">
                <div className="label-with-action">
                  <label htmlFor="desenvolvedoraId">Desenvolvedora *</label>
                  <button
                    type="button"
                    className="btn-inline-modal"
                    onClick={() => {
                      setNomeDev('');
                      setEditandoDevId(null);
                      setModalDevAberto(true);
                    }}
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

              {/* Seleção de Gêneros com botão de abrir Modal */}
              <div className="form-group">
                <div className="label-with-action">
                  <label>Gêneros do Jogo</label>
                  <button
                    type="button"
                    className="btn-inline-modal"
                    onClick={() => {
                      setNomeGenero('');
                      setEditandoGeneroId(null);
                      setModalGeneroAberto(true);
                    }}
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

            {/* Coluna Direita Upload e Preview da Capa */}
            <div className="form-upload">
              <label>Imagem de Capa (Horizontal 16:9) *</label>
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
              <button
                type="button"
                className="btn-secondary"
                onClick={limparFormularioJogo}
              >
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


      {/* TABELA EM LINHA DE JOGOS CADASTRADOS */}
      <section className="panel-box">
        <div className="panel-header">
          <div>
            <h2>
              <span className="material-icons panel-title-icon">view_list</span>
              JOGOS CADASTRADOS ({jogos.length})
            </h2>
            <p>
              Visualize os jogos em linha e utilize os botões de ação para alterar ou apagar.
            </p>
          </div>
        </div>

        {carregandoLista ? (
          <div className="table-empty">Carregando jogos cadastrados...</div>
        ) : jogos.length === 0 ? (
          <div className="table-empty">
            Nenhum jogo cadastrado ainda. Utilize o formulário acima para cadastrar o primeiro!
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="inline-table">
              <thead>
                <tr>
                  <th className="col-capa">Capa</th>
                  <th className="col-nome">Nome</th>
                  <th className="col-dev">Desenvolvedora</th>
                  <th className="col-preco">Preço</th>
                  <th className="col-acoes">Ações</th>
                </tr>
              </thead>
              <tbody>
                {jogos.map((jogo) => (
                  <tr
                    key={jogo.id}
                    className={editandoId === jogo.id ? 'editing-row' : ''}
                  >
                    <td className="col-capa">
                      <div className="table-thumb">
                        {jogo.imagem ? (
                          <img src={jogo.imagem} alt={jogo.nome} />
                        ) : (
                          <span className="material-icons thumb-placeholder-icon">image</span>
                        )}
                      </div>
                    </td>
                    <td className="col-nome">
                      <strong>{jogo.nome}</strong>
                      <span className="row-subtext">
                        {jogo.ano_lancamento} •{' '}
                        {jogo.generos?.map((g) => g.nome).join(', ') || 'Sem gênero'}
                      </span>
                    </td>
                    <td className="col-dev">
                      {jogo.desenvolvedora?.nome || '—'}
                    </td>
                    <td className="col-preco">
                      R$ {Number(jogo.preco).toFixed(2).replace('.', ',')}
                    </td>
                    <td className="col-acoes">
                      <div className="table-actions">
                        <button
                          type="button"
                          className="btn-action-icon edit"
                          title="Alterar Jogo"
                          onClick={() => iniciarEdicaoJogo(jogo)}
                        >
                          <span className="material-icons">edit</span>
                        </button>
                        <button
                          type="button"
                          className="btn-action-icon delete"
                          title="Apagar Jogo"
                          onClick={() => handleDeletarJogo(jogo)}
                        >
                          <span className="material-icons">delete_outline</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* MODAL CADASTRO E GERENCIAMENTO DE DESENVOLVEDORAS */}
      <Modal
        isOpen={modalDevAberto}
        onClose={() => setModalDevAberto(false)}
        title={
          <>
            <span className="material-icons">business</span>
            Gerenciar Desenvolvedoras
          </>
        }
      >
        <form className="modal-mini-form" onSubmit={handleSalvarDesenvolvedora}>
          <input
            type="text"
            required
            placeholder="Nome da desenvolvedora (ex: Rockstar Games)"
            value={nomeDev}
            onChange={(e) => setNomeDev(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={salvandoDev}
          >
            <span className="material-icons icon-sm">
              {editandoDevId ? 'check' : 'add'}
            </span>
            {editandoDevId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editandoDevId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditandoDevId(null);
                setNomeDev('');
              }}
              title="Cancelar edição"
            >
              <span className="material-icons icon-sm">close</span>
            </button>
          )}
        </form>

        <ul className="modal-entity-list">
          {desenvolvedoras.map((dev) => (
            <li key={dev.id}>
              <span>{dev.nome}</span>
              <div className="table-actions">
                <button
                  type="button"
                  className="btn-action-icon edit"
                  title="Editar"
                  onClick={() => {
                    setEditandoDevId(dev.id);
                    setNomeDev(dev.nome);
                  }}
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  type="button"
                  className="btn-action-icon delete"
                  title="Excluir"
                  onClick={() => handleDeletarDesenvolvedora(dev)}
                >
                  <span className="material-icons">delete_outline</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Modal>

      {/* MODAL CADASTRO E GERENCIAMENTO DE GÊNEROS */}
      <Modal
        isOpen={modalGeneroAberto}
        onClose={() => setModalGeneroAberto(false)}
        title={
          <>
            <span className="material-icons">local_offer</span>
            Gerenciar Gêneros
          </>
        }
      >
        <form className="modal-mini-form" onSubmit={handleSalvarGenero}>
          <input
            type="text"
            required
            placeholder="Nome do gênero (ex: Terror, Corrida, RPG)"
            value={nomeGenero}
            onChange={(e) => setNomeGenero(e.target.value)}
          />
          <button
            type="submit"
            className="btn-primary"
            disabled={salvandoGenero}
          >
            <span className="material-icons icon-sm">
              {editandoGeneroId ? 'check' : 'add'}
            </span>
            {editandoGeneroId ? 'Atualizar' : 'Adicionar'}
          </button>
          {editandoGeneroId && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => {
                setEditandoGeneroId(null);
                setNomeGenero('');
              }}
              title="Cancelar edição"
            >
              <span className="material-icons icon-sm">close</span>
            </button>
          )}
        </form>

        <ul className="modal-entity-list">
          {generos.map((gen) => (
            <li key={gen.id}>
              <span>{gen.nome}</span>
              <div className="table-actions">
                <button
                  type="button"
                  className="btn-action-icon edit"
                  title="Editar"
                  onClick={() => {
                    setEditandoGeneroId(gen.id);
                    setNomeGenero(gen.nome);
                  }}
                >
                  <span className="material-icons">edit</span>
                </button>
                <button
                  type="button"
                  className="btn-action-icon delete"
                  title="Excluir"
                  onClick={() => handleDeletarGenero(gen)}
                >
                  <span className="material-icons">delete_outline</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      </Modal>
    </div>
  );
}
