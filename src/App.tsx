import './App.css'
import { Routes, Route } from 'react-router-dom'
import GamesList from './components/Gamelist'
import Scorebug from './pages/Scorebug'

function App() {
  return (
    <Routes>
      <Route path="/" element={<GamesList />} />
      <Route path="/game/:gamePk" element={<Scorebug />} />
    </Routes>
  )
}

export default App;
