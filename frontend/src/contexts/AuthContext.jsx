import { createContext, useContext, useEffect, useState } from 'react';
import { authService } from '../services/auth.service.js';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const controller = new AbortController();
    authService
      .me(controller.signal)
      .then(setUser)
      .catch(() => setUser(null))
      .finally(() => {
        if (!controller.signal.aborted) setChecking(false);
      });
    return () => controller.abort();
  }, []);

  async function login(credentials) {
    const loggedUser = await authService.login(credentials);
    setUser(loggedUser);
  }

  async function register(data) {
    await authService.register(data);
    await login({ email: data.email, password: data.password });
  }

  async function logout() {
    await authService.logout();
    setUser(null);
  }

  async function updateProfile(changes) {
    const updatedUser = await authService.updateMe(changes);
    setUser(updatedUser);
  }

  async function deleteAccount() {
    await authService.deleteMe();
    setUser(null);
  }

  return (
    <AuthContext.Provider
      value={{ user, checking, login, register, logout, updateProfile, deleteAccount }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);
