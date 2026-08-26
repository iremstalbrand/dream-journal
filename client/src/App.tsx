import {Routes, Route} from 'react-router-dom'
import Dreams from './pages/Dreams'
import NewDream from './pages/NewDream'
import DreamDetail from './pages/DreamDetail'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<NewDream />} />
      <Route path="/dreams" element={<Dreams />} />
      <Route path="/dream/:id" element={<DreamDetail />} />
    </Routes>
  )
}