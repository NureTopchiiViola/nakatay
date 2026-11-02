import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Catalog } from './pages/Catalog/Catalog';
import { CarComparison } from './pages/CarComparison/CarComparison';
import { CarDetails } from './pages/CarDetails/CarDetails';
import { Configurator } from './pages/Configurator/Configurator';
import { NotFound } from './pages/NotFound/NotFound';
import { CarComparisonProvider } from './context/CarComparisonContext';

export default function App() {
  return (
    <CarComparisonProvider>
      <Router>
        <div className="app-layout">
          <Header />
        
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Catalog />} />

            {/* dynamic URL для конкретного авто (id) */}
            <Route path="/cars/:id" element={<CarDetails />} />

            {/*  порівняння */}
            <Route path="/compare" element={<CarComparison />} />
            <Route path="/create" element={<Configurator />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </main>

        <Footer />
      </div>
    </Router>
    </CarComparisonProvider>
  );
}
