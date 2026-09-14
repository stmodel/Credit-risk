import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom';
import DataTab from './pages/DataTab';
import AssumptionsTab from './pages/AssumptionsTab';
import CreditRiskTab from './pages/CreditRiskTab';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <div className="app-layout">
        <aside className="sidebar">
          <div className="sidebar-header">
  <span className="sidebar-badge">BOT</span>
  <h1>Stress Testing</h1>
</div>
          <nav className="sidebar-nav">
            <NavLink to="/" end className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              Data
            </NavLink>
            <NavLink to="/assumptions" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              Assumptions
            </NavLink>
            <NavLink to="/credit-risk" className={({ isActive }) => isActive ? 'sidebar-link active' : 'sidebar-link'}>
              Credit Risk
            </NavLink>
          </nav>
        </aside>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<DataTab />} />
            <Route path="/assumptions" element={<AssumptionsTab />} />
            <Route path="/credit-risk" element={<CreditRiskTab />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}

export default App;