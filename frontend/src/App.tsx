import React, { useState } from 'react';
import { Header, type PageView } from './components/layout/Header';
import { CarDetails } from './pages/CarDetails/CarDetails';
import { CarComparison } from './pages/CarComparison/CarComparison';
import './App.css';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageView>('comparison');

  const handleNavigate = (page: PageView) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="app-layout">
      <Header currentPage={currentPage} onNavigate={handleNavigate} />
      
      <main className="main-content">
        {currentPage === 'comparison' && (
          <CarComparison onNavigateToCatalog={() => handleNavigate('catalog')} />
        )}

        {currentPage === 'details' && (
          <CarDetails />
        )}

        {currentPage === 'catalog' && (
          <div style={{ padding: '4rem', textAlign: 'center' }}>
            <h2>Каталог авто (в розробці)</h2>
            <button onClick={() => handleNavigate('comparison')} style={{ marginTop: '1rem' }}>
              Перейти до порівняння
            </button>
          </div>
        )}
      </main>
    </div>
  );
}