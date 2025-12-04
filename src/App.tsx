import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import GamePage from './pages/GamePage'
import About from './pages/About'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/game" element={<GamePage />} />
        <Route path="/a-propos" element={<About />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
