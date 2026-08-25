import {Routes, Route} from 'react-router-dom'
import Dreams from './pages/Dreams'
import NewDream from './pages/NewDream'

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Dreams />} />
      <Route path="/new" element={<NewDream />} />
    </Routes>
  )
}