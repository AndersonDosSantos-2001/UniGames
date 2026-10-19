import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Navbar from './components/Navbar';
import BibliotecaPage from './pages/biblioteca';
import JogosPage from './pages/jogos';

export default function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <main>
        <Routes>
          <Route path="/" element={<Navigate to="/biblioteca" replace />} />
          <Route path="/biblioteca" element={<BibliotecaPage />} />
          <Route path="/jogos" element={<JogosPage />} />
          <Route path="*" element={<Navigate to="/biblioteca" replace />} />
        </Routes>
      </main>
    </BrowserRouter>
  );
}
