import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.css';
import { Footer } from './components/layout/Footer';
import { Header } from './components/layout/Header';
import { Catalog } from './pages/Catalog/Catalog';
import { CarComparison } from './pages/CarComparison/CarComparison';
import { CarDetails } from './pages/CarDetails/CarDetails';
import { Configurator } from './pages/Configurator/Configurator';
import { Checkout } from './pages/Checkout/Checkout';
import { NotFound } from './pages/NotFound/NotFound';
import { CarComparisonProvider } from './context/CarComparisonContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Profile } from './pages/Profile/Profile';
import { Favorites } from './pages/Favorites/Favorites';
import { FavoritesProvider } from './context/FavoritesContext';
import { AuthModalProvider } from './context/AuthModalProvider';
import { Applications } from './pages/Applications/Applications';

export default function App() {
  return (
    <AuthModalProvider>
      <FavoritesProvider>
        <CarComparisonProvider>
          <Router>
            <div className="app-layout">
              <Header />
            
              <main className="main-content">
                <Routes>
                  <Route path="/" element={<Catalog />} />
                  <Route path="/cars/:id" element={<CarDetails />} />
                  <Route path="/compare" element={<CarComparison />} />
                  <Route path="/create" element={<Configurator />} />
                  <Route path="/checkout" element={<Checkout />} />
                  <Route path="/order/:id" element={<Checkout />} />
                  <Route
                    path="/orders"
                    element={<ProtectedRoute><Applications /></ProtectedRoute>}
                  />
                  <Route
                    path="/favorites"
                    element={<ProtectedRoute><Favorites /></ProtectedRoute>}
                  />

                  <Route 
                    path="/profile" 
                    element={
                      <ProtectedRoute>
                        <Profile />
                      </ProtectedRoute>
                    } 
                  />

                  <Route 
                    path="/admin" 
                    element={
                      <ProtectedRoute requiredRole="ADMIN">
                        <Applications />
                      </ProtectedRoute>
                    } 
                  />

                  <Route path="*" element={<NotFound />} />
                </Routes>
              </main>

              <Footer />
            </div>
          </Router>
        </CarComparisonProvider>
      </FavoritesProvider>
    </AuthModalProvider>
  );
}