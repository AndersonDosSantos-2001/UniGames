import './styles.css';

export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null;

  return (
    <div className="app-modal-overlay" onClick={onClose}>
      <div className="app-modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="app-modal-header">
          <h3>{title}</h3>
          <button type="button" className="app-modal-close" onClick={onClose} title="Fechar">
            <span className="material-icons icon-md">close</span>
          </button>
        </div>
        <div className="app-modal-body">
          {children}
        </div>
      </div>
    </div>
  );
}
