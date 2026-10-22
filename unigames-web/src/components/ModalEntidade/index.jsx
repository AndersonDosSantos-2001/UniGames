import './styles.css';
import { useEffect, useRef, useState } from 'react';
import Modal from '../../components/Modal';

export default function ModalEntidade({
  isOpen,
  onClose,
  titulo,
  icone,
  placeholder,
  itens,
  onSalvar,
  onDeletar,
}) {
  const [nome, setNome] = useState('');
  const [editandoId, setEditandoId] = useState(null);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState({ tipo: '', texto: '' });
  const [itemParaDeletar, setItemParaDeletar] = useState(null);

  const topoModalRef = useRef(null);
  const inputNomeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setNome('');
      setEditandoId(null);
      setMensagem({ tipo: '', texto: '' });
      setItemParaDeletar(null);
    }
  }, [isOpen]);

  function subirTopoModal() {
    setTimeout(() => {
      topoModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
  }

  function exibirMensagem(tipo, texto) {
    setMensagem({ tipo, texto });
    subirTopoModal();

    setTimeout(() => {
      setMensagem((atual) => (atual.texto === texto ? { tipo: '', texto: '' } : atual));
    }, 5000);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!nome.trim()) {
      exibirMensagem('erro', 'Preencha o nome antes de salvar.');
      inputNomeRef.current?.focus();
      return;
    }

    try {
      setSalvando(true);
      await onSalvar(nome.trim(), editandoId);
      exibirMensagem(
        'sucesso',
        editandoId ? 'Registro atualizado com sucesso!' : 'Registro adicionado com sucesso!'
      );
      setNome('');
      setEditandoId(null);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Erro ao salvar registro.');
    } finally {
      setSalvando(false);
    }
  }

  async function handleConfirmarDelecao() {
    if (!itemParaDeletar) return;
    try {
      await onDeletar(itemParaDeletar);
      if (editandoId === itemParaDeletar.id) {
        setEditandoId(null);
        setNome('');
      }
      exibirMensagem('sucesso', `"${itemParaDeletar.nome}" removido com sucesso!`);
    } catch (err) {
      exibirMensagem('erro', err.message || 'Não foi possível excluir este registro.');
    } finally {
      setItemParaDeletar(null);
    }
  }

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setNome(item.nome);
    setItemParaDeletar(null);
    setMensagem({ tipo: '', texto: '' });
    subirTopoModal();
    inputNomeRef.current?.focus();
  }

  function solicitarDelecao(item) {
    setMensagem({ tipo: '', texto: '' });
    setItemParaDeletar(item);
    subirTopoModal();
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <span className="material-icons">{icone}</span>
          {titulo}
        </>
      }
    >
      <div ref={topoModalRef} />

      {/* CAIXA DE CONFIRMAÇÃO DE EXCLUSÃO DENTRO DO MODAL */}
      {itemParaDeletar && (
        <div className="modal-delete-box">
          <span className="feedback-text-content" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="material-icons icon-md">warning_amber</span>
            Deseja apagar <strong>"{itemParaDeletar.nome}"</strong>?
          </span>

          <div className="modal-delete-actions">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setItemParaDeletar(null)}
            >
              Cancelar
            </button>
            <button
              type="button"
              className="btn-danger"
              onClick={handleConfirmarDelecao}
            >
              Confirmar
            </button>
          </div>
        </div>
      )}

      {/* BANNER DE FEEDBACK (SUCESSO OU ERRO DE EXCLUSÃO/CADASTRO) */}
      {mensagem.texto && (
        <div className={`feedback-banner ${mensagem.tipo}`} style={{ marginBottom: '14px' }}>
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

      <form className="modal-mini-form" onSubmit={handleSubmit} noValidate>
        <input
          ref={inputNomeRef}
          type="text"
          required
          placeholder={`${placeholder} *`}
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={salvando}>
          <span className="material-icons icon-sm">
            {editandoId ? 'check' : 'add'}
          </span>
          {editandoId ? 'Atualizar' : 'Adicionar'}
        </button>

        {editandoId && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => {
              setEditandoId(null);
              setNome('');
            }}
            title="Cancelar edição"
          >
            <span className="material-icons icon-sm">close</span>
          </button>
        )}
      </form>

      <ul className="modal-entity-list">
        {itens.map((item) => (
          <li key={item.id}>
            <span>{item.nome}</span>
            <div className="table-actions">
              <button
                type="button"
                className="btn-action-icon edit"
                title="Editar"
                onClick={() => iniciarEdicao(item)}
              >
                <span className="material-icons">edit</span>
              </button>
              <button
                type="button"
                className="btn-action-icon delete"
                title="Excluir"
                onClick={() => solicitarDelecao(item)}
              >
                <span className="material-icons">delete_outline</span>
              </button>
            </div>
          </li>
        ))}
      </ul>
    </Modal>
  );
}