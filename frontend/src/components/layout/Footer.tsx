import facebookIcon from '../../assets/Facebook.svg'
import instagramIcon from '../../assets/Instagram.svg'
import xIcon from '../../assets/X.svg'

export function Footer() {
  return (
    <footer className="site-footer">
      <a aria-label="Nakatay — на головну" className="wordmark" href="#">
        nakatay
      </a>
      <nav aria-label="Посилання внизу сторінки">
        <a href="#locations">Наші локації</a>
        <a href="#configurator">Конфігуратор</a>
        <a href="#test-drive">Записатись на тест-драйв</a>
        <a href="#contacts">Контакти</a>
        <a href="#privacy">Політика конфіденційності</a>
      </nav>
      <div aria-label="Соціальні мережі" className="social-links" role="group">
        <img alt="Instagram" src={instagramIcon} />
        <img alt="Facebook" src={facebookIcon} />
        <img alt="X" src={xIcon} />
      </div>
      <div className="footer-bottom">
        <a href="#legal">Юридична інформація</a>
        <a href="#feedback">Зв'язатись з нами</a>
      </div>
    </footer>
  )
}
