import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { CarDetails } from './pages/CarDetails/CarDetails';
import { CarComparison } from './pages/CarComparison/CarComparison';
import { Configurator } from './pages/Configurator/Configurator';
import './App.css';

export default function App() {
  return (
    <Router>
      <div className="app-layout">
        <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Navigate to="/catalog" replace />} />
            
            {/* тут поки що нічого немає */}
            <Route path="/catalog" element={
              <div style={{ padding: '4rem', textAlign: 'center' }}>
                <h2>Каталог авто (в розробці)</h2>
              </div>
            } />

            {/* dynamic URL для конкретного авто (id) */}
            <Route path="/cars/:id" element={<CarDetails />} />

            {/*  порівняння */}
            <Route path="/compare" element={<CarComparison />} />
            <Route path="/create" element={<Configurator />} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}
