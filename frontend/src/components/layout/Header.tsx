import { Link, NavLink, useNavigate } from 'react-router-dom';
import { MdOutlinePerson, MdFavorite, MdOutlineFavoriteBorder, MdAdminPanelSettings } from 'react-icons/md';
import { Button } from '../../components/ui/Button';
import { useFavorites } from '../../context/useFavorites';
import { useAuthModal } from '../../context/useAuthModal';

export function Header() {
  const navigate = useNavigate();
  const { openAuthModal } = useAuthModal();
  const { favorites } = useFavorites();

  const isAuthenticated = !!localStorage.getItem('accessToken');
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole?.toUpperCase() === 'ADMIN';

  const handleUserIconClick = () => {
    if (isAuthenticated) {
      navigate('/profile');
    } else {
      openAuthModal();
    }
  };

  const handleFavoritesClick = () => {
    if (isAuthenticated) {
      navigate('/favorites');
    } else {
      openAuthModal();
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
          {isAuthenticated && isAdmin && (
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
            iconLeft={isAuthenticated && favorites.length > 0 ? <MdFavorite size={22} /> : <MdOutlineFavoriteBorder size={22} />} 
            aria-label={isAuthenticated && favorites.length > 0 ? `Обране: ${favorites.length}` : 'Обране'} 
            onClick={handleFavoritesClick}
          />
        </div>
      </header>
    </>
  );
}