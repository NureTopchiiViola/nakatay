import { Link, useLocation } from 'react-router-dom';
import { MdOutlineSearch, MdOutlinePerson, MdOutlineFavoriteBorder } from 'react-icons/md';
import { Input } from '../../components/ui/Input';
import { Button } from '../../components/ui/Button';

export function Header() {
  // Отримуємо поточний шлях з URL
  const location = useLocation();
  const currentPath = location.pathname;

  return (
    <header className="site-header">
      <Link aria-label="Nakatay — на головну" className="wordmark" to="/catalog">
        nakatay
      </Link>

      <nav aria-label="Основна навігація" className="main-nav">
        <Link 
          to="/catalog" 
          className={currentPath.startsWith('/catalog') ? 'active' : ''}
        >
          Автомобілі
        </Link>
        <Link 
          to="/test-drive" 
          className={currentPath === '/test-drive' ? 'active' : ''}
        >
          Тест-драйв
        </Link>
        <Link 
          to="/create" 
          className={currentPath === '/create' ? 'active' : ''}
        >
          Створити
        </Link>
        <Link 
          to="/compare" 
          className={currentPath === '/compare' ? 'active' : ''}
        >
          Порівняти
        </Link>
      </nav>

      <div className="header-actions">
        <Input 
          className="header-search"
          iconLeft={<MdOutlineSearch size={20} />} 
          placeholder="Пошук" 
        />
        <Button 
          variant="ghost" 
          iconLeft={<MdOutlinePerson size={22} />} 
          aria-label="Профіль" 
        />
        <Button 
          variant="ghost" 
          iconLeft={<MdOutlineFavoriteBorder size={22} />} 
          aria-label="Обране" 
        />
      </div>
    </header>
  );
}
