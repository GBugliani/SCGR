import Pessoas from './pages/Pessoas.tsx';
import Categorias from './pages/Categorias.tsx';
import Transacoes from './pages/Transacoes.tsx';
import Relatorios from './pages/Relatorios.tsx';
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';

const appRoutes = [
  { path: '/', label: 'Relatorios', element: <Relatorios />, end: true },
  { path: '/pessoas', label: 'Pessoas', element: <Pessoas /> },
  { path: '/categorias', label: 'Categorias', element: <Categorias /> },
  { path: '/transacoes', label: 'Transacoes', element: <Transacoes /> },
];

function App() {
  const currentYear = new Date().getFullYear();

  return (
    <BrowserRouter>
      <div className="app-shell">
        <header className="app-header">
          <h1 className="app-title">Controle de Gastos Residenciais</h1>
          <p className="app-subtitle">Organize pessoas, categorias, transacoes e acompanhe seus totais em um unico painel.</p>
          <nav>
            <ul className="nav-list">
              {appRoutes.map((route) => (
                <li key={route.path}>
                  <NavLink
                    to={route.path}
                    end={route.end}
                    className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
                  >
                    {route.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>
        </header>

        <main className="page-card">
          <Routes>
            {appRoutes.map((route) => (
              <Route key={route.path} path={route.path} element={route.element} />
            ))}
          </Routes>
        </main>

        <footer className="app-footer">
          <small>Copyright - Guilherme Bugliani - {currentYear}</small>
        </footer>
      </div>
    </BrowserRouter>
  );
}

export default App;