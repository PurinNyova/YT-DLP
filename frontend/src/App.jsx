import { useState } from 'react'
import { Box } from '@chakra-ui/react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import HomePage from './pages/HomePage'
import HistoryPage from './pages/HistoryPage'

export const PLATFORMS = {
  youtube: { name: 'YouTube', placeholder: 'https://www.youtube.com/watch?v=...' },
  instagram: { name: 'Instagram', placeholder: 'https://www.instagram.com/reel/...' },
  x: { name: 'X (Twitter)', placeholder: 'https://x.com/user/status/...' },
  tiktok: { name: 'TikTok', placeholder: 'https://www.tiktok.com/@user/video/...' },
};

function App() {
  const [platform, setPlatform] = useState('youtube');

  return (
    <Box minH="100vh">
      <Navbar platform={platform} setPlatform={setPlatform} />
      <Routes>
        <Route path="/" element={<HomePage platform={platform} />} />
        <Route path="/history" element={<HistoryPage />} />
      </Routes>
    </Box>
  )
}

export default App
