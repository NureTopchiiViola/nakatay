export function Header() {
  return (
    <header className="site-header">
      <a aria-label="Nakatay — на головну" className="wordmark" href="#">
        nakatay
      </a>
      <nav aria-label="Основна навігація" className="main-nav">
        <a href="#catalog">Автомобілі</a>
        <a href="#test-drive">Тест-драйв</a>
        <a href="#create">Створити</a>
        <a href="#compare">Порівняти</a>
      </nav>
    </header>
  )
}
