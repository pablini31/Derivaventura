import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import HomePage from './pages/HomePage'
import LoginPage from './pages/LoginPage'
import RegisterPage from './pages/RegisterPage'
import DashboardPage from './pages/DashboardPage'
import GamePage from './pages/GamePage'
import RankingPage from './pages/RankingPage'
import DailyChallengePage from './pages/DailyChallengePage'

function App() {
  return (
    <>
      {/* Fondo animado con patrón Bomberman */}
      <div className="bomberman-background"></div>
      
      <Router>
        <div className="min-h-screen relative z-10">
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/game" element={<GamePage />} />
            <Route path="/ranking" element={<RankingPage />} />
            <Route path="/daily-challenge" element={<DailyChallengePage />} />
          </Routes>
        </div>
      </Router>
    </>
  )
}

export default App
