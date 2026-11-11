import { Route, Routes } from 'react-router-dom';
import { Layout } from './components/Layout/Layout.jsx';
import { LandingPage } from './pages/LandingPage/LandingPage.jsx';
import { HistoryPage } from './pages/HistoryPage/HistoryPage.jsx';
import { NotFoundPage } from './pages/NotFoundPage/NotFoundPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<LandingPage />} />
        <Route path="downloads" element={<LandingPage />} />
        <Route path="conversor" element={<LandingPage />} />
        <Route path="historico" element={<HistoryPage />} />
        <Route path="login" element={<LoginPage />} />
        <Route path="cadastro" element={<RegisterPage />} />
        <Route
          path="perfil"
          element={
            <RequireLogin>
              <ProfilePage />
            </RequireLogin>
          }
        />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
