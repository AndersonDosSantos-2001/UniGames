import { NavLink } from 'react-router-dom';
import './styles.css';

export default function Navbar() {
  return (
    <header className="app-navbar">
      <div className="app-navbar-container">
        <div className="app-brand">
          <span className="material-icons app-logo-icon">sports_esports</span>
          <div>
            <span className="app-brand-title">UNIGAMES</span>
            <span className="app-brand-subtitle">LIBRARY EDITION</span>
          </div>
        </div>

        <nav className="app-nav-links">
          <NavLink
            to="/biblioteca"
            className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-icons icon-sm">video_library</span>
            BIBLIOTECA
          </NavLink>
          <NavLink
            to="/jogos"
            className={({ isActive }) => `app-nav-link ${isActive ? 'active' : ''}`}
          >
            <span className="material-icons icon-sm">add_box</span>
            GERENCIAR / CADASTRAR JOGOS
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
