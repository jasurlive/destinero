import { BrowserRouter, Route, Routes } from 'react-router'
import '../css/reset.css'
import '../css/theme.css'
import '../css/page.css'
import Layout from '../components/Layout'
import Embed from '../components/Embed'
import MapPage from '../pages/MapPage'
import Places from '../pages/Places'
import Help from '../pages/Help'
import NotFound from '../pages/NotFound'

// add a page: create it in src/pages, add a <Route> here and an item in Menu.tsx
export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route element={<Layout />}>
          <Route index element={<MapPage />} />
          <Route path="places" element={<Places />} />
          <Route path="help" element={<Help />} />
          <Route path="*" element={<NotFound />} />
        </Route>

        {/* no navbar, for iframes on other sites (see README) */}
        <Route element={<Embed />}>
          <Route path="itravelmap" element={<MapPage embed />} />
          <Route path="iblogs" element={<Places embed />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}
