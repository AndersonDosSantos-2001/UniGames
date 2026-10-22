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

  const topoModalRef = useRef(null);
  const inputNomeRef = useRef(null);

  useEffect(() => {
    if (!isOpen) {
      setNome('');
      setEditandoId(null);
      setMensagem({ tipo: '', texto: '' });
    }
  }, [isOpen]);

  function exibirMensagem(tipo, texto) {
    setMensagem({ tipo, texto });

    setTimeout(() => {
      topoModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 50);

    setTimeout(() => {
      setMensagem((atual) => (atual.texto === texto ? { tipo: '', texto: '' } : atual));
    }, 4000);
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

  function iniciarEdicao(item) {
    setEditandoId(item.id);
    setNome(item.nome);
    setMensagem({ tipo: '', texto: '' });
    topoModalRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    inputNomeRef.current?.focus();
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
                onClick={() => onDeletar(item)}
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