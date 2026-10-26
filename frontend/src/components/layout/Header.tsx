import React from 'react';
import { MdOutlineSearch, MdOutlinePerson, MdOutlineFavoriteBorder } from 'react-icons/md';
import { Input } from '../../components/ui/Input'; // Adjust path if needed
import { Button } from '../../components/ui/Button'; // Adjust path if needed

export type PageView = 'catalog' | 'test-drive' | 'create' | 'comparison' | 'details';

interface HeaderProps {
  currentPage?: PageView;
  onNavigate?: (page: PageView) => void;
}

export function Header({ currentPage, onNavigate }: HeaderProps) {
  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, page: PageView) => {
    if (onNavigate) {
      e.preventDefault();
      onNavigate(page);
    }
  };

  return (
    <header className="site-header">
      <a 
        aria-label="Nakatay — на головну" 
        className="wordmark" 
        href="#catalog"
        onClick={(e) => handleNavClick(e, 'catalog')}
      >
        nakatay
      </a>

      <nav aria-label="Основна навігація" className="main-nav">
        <a 
          href="#catalog" 
          className={currentPage === 'catalog' ? 'active' : ''}
          onClick={(e) => handleNavClick(e, 'catalog')}
        >
          Автомобілі
        </a>
        <a 
          href="#test-drive" 
          className={currentPage === 'test-drive' ? 'active' : ''}
          onClick={(e) => handleNavClick(e, 'test-drive')}
        >
          Тест-драйв
        </a>
        <a 
          href="#create" 
          className={currentPage === 'create' ? 'active' : ''}
          onClick={(e) => handleNavClick(e, 'create')}
        >
          Створити
        </a>
        <a 
          href="#compare" 
          className={currentPage === 'comparison' ? 'active' : ''}
          onClick={(e) => handleNavClick(e, 'comparison')}
        >
          Порівняти
        </a>
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