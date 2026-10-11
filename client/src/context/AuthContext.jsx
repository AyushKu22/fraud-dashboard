import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext();
export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!localStorage.getItem('token')) return setLoading(false);
    api.get('/auth/me').then((r) => setUser(r.data)).catch(() => localStorage.removeItem('token')).finally(() => setLoading(false));
  }, []);

  const startSession = (data) => { localStorage.setItem('token', data.token); setUser(data.user); };

  const login = async (email, password) => startSession((await api.post('/auth/login', { email, password })).data);
  const signup = async (name, email, password) => startSession((await api.post('/auth/signup', { name, email, password })).data);
  const logout = () => { localStorage.removeItem('token'); setUser(null); };
  const deleteAccount = async (password) => {
    await api.delete('/auth/me', { data: { password } });
    logout();
  };

  return <AuthContext.Provider value={{ user, loading, login, signup, logout, deleteAccount }}>{children}</AuthContext.Provider>;
}