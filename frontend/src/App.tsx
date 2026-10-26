import { Footer } from './components/layout/Footer'
import { Header } from './components/layout/Header'
import { CarDetails } from './pages/CarDetails/CarDetails'
import './App.css'

function App() {
  return (
    <div className="app-shell">
      <Header />
      <main className="site-main">
        {/* Render your new page here */}
        <CarDetails />
      </main>
      <Footer />
    </div>
  )
}

export default App