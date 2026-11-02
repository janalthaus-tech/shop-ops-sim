import { Link, NavLink, Navigate, Route, Routes } from 'react-router-dom';
import BoardApp from './board/App';
import FinanceApp from './finance/App';

function Landing() {
  return (
    <main className="shell-home">
      <h1>Shop Ops Sim</h1>
      <p>Two training tools for running an auto repair shop, in one app.</p>
      <div className="shell-home__cards">
        <Link to="/board" className="shell-home__card">
          <h2>Board</h2>
          <p>Kanban "Board" training simulator: scenarios, magnets, flow, debrief.</p>
        </Link>
        <Link to="/finance" className="shell-home__card">
          <h2>Finance</h2>
          <p>P&amp;L, balance sheet and KPI calculator with presets and print summary.</p>
        </Link>
      </div>
      <p className="shell-home__note">Illustrative training tools only — not financial advice.</p>
    </main>
  );
}

export default function App() {
  return (
    <div className="shell">
      <nav className="shell-nav no-print" aria-label="Main">
        <NavLink to="/" end className="shell-nav__brand">Shop Ops Sim</NavLink>
        <NavLink to="/board" className="shell-nav__link">Board</NavLink>
        <NavLink to="/finance" className="shell-nav__link">Finance</NavLink>
      </nav>
      <div className="shell-main">
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route path="/board/*" element={<div className="board-app"><BoardApp /></div>} />
          <Route path="/finance" element={<FinanceApp />} />
          <Route path="/flow" element={<Navigate to="/board/flow" replace />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </div>
  );
}
