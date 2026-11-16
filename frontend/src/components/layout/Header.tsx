import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdOutlinePerson, MdOutlineFavoriteBorder, MdAdminPanelSettings } from 'react-icons/md';
import { Button } from '../../components/ui/Button';
import { AuthModal } from '../../components/auth/AuthModal';

export function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  const isAdminOrModerator = userRole === 'Admin' || userRole === 'Moderator';

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      setIsAuthModalOpen(true);
    }
  };

  return (
    <>
      <header className="site-header">
        <Link aria-label="Nakatay — на головну" className="wordmark" to="/">
          nakatay
        </Link>

        <nav aria-label="Основна навігація" className="main-nav">
          <NavLink to="/" end className={({ isActive }) => isActive ? 'active' : undefined}>
            Автомобілі
          </NavLink>
          <NavLink to="/test-drive" className={({ isActive }) => isActive ? 'active' : undefined}>
            Тест-драйв
          </NavLink>
          <NavLink to="/create" className={({ isActive }) => isActive ? 'active' : undefined}>
            Створити
          </NavLink>
          <NavLink to="/compare" className={({ isActive }) => isActive ? 'active' : undefined}>
            Порівняти
          </NavLink>

          {isAuthenticated && isAdminOrModerator && (
            <NavLink to="/admin" className={({ isActive }) => isActive ? 'active' : undefined} style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MdAdminPanelSettings size={18} />
              Панель керування
            </NavLink>
          )}
        </nav>
        
        <div className="header-actions">
          <Button 
            variant="ghost" 
            iconLeft={<MdOutlinePerson size={22} />} 
            aria-label="Профіль"
            onClick={handleUserIconClick}
            className="user-icon-btn" 
          />
          <Button 
            variant="ghost" 
            iconLeft={<MdOutlineFavoriteBorder size={22} />} 
            aria-label="Обране" 
          />
          <AuthModal 
            isOpen={isAuthModalOpen} 
            onClose={() => setIsAuthModalOpen(false)} 
          />
        </div>
      </header>
    </>
  );
}