import { Link, NavLink } from 'react-router-dom';
import { MdOutlinePerson, MdOutlineFavoriteBorder } from 'react-icons/md';
import { Button } from '../../components/ui/Button';

export function Header() {
  return (
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
      </nav>

      <div className="header-actions">
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
