import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout.jsx';
import { LandingPage } from './pages/LandingPage/LandingPage.jsx';
import { DownloadPage } from './pages/DownloadPage/DownloadPage.jsx';
import { ConvertPage } from './pages/ConvertPage/ConvertPage.jsx';
import { HistoryPage } from './pages/HistoryPage/HistoryPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="downloads" element={<DownloadPage />} />
        <Route path="conversor" element={<ConvertPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
