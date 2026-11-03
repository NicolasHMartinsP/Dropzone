import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { systemService } from '../services/api.js';
import { Toast } from '../components/Toast/Toast.jsx';

const AppContext = createContext(null);
export function AppProvider({ children }) {
  const [health, setHealth] = useState(null);
  const [connection, setConnection] = useState('checking');
  const [toast, setToast] = useState(null);
  const notify = useCallback(
    (message, type = 'success') => setToast({ message, type, id: Date.now() }),
    [],
  );
  useEffect(() => {
    const controller = new AbortController();
    const check = async () => {
      try {
        const data = await systemService.health(controller.signal);
        setHealth(data);
        setConnection('online');
      } catch (error) {
        if (error.name !== 'AbortError') setConnection('offline');
      }
    };
    check();
    const timer = setInterval(check, 30000);
    return () => {
      controller.abort();
      clearInterval(timer);
    };
  }, []);
  useEffect(() => {
    if (!toast) return;
    const timer = setTimeout(() => setToast(null), 5000);
    return () => clearTimeout(timer);
  }, [toast]);
  return (
    <AppContext.Provider value={{ health, connection, notify }}>
      {children}
      <Toast toast={toast} onClose={() => setToast(null)} />
    </AppContext.Provider>
  );
}
export const useApp = () => useContext(AppContext);
