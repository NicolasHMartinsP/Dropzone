import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';

export function RequireLogin({ children }) {
  const { user, checking } = useAuth();
  if (checking)
    return (
      <p className="container" role="status">
        Carregando…
      </p>
    );
  if (!user) return <Navigate to="/login" replace />;
  return children;
}
