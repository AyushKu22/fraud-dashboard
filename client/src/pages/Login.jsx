import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import errorMessage from '../utils/errorMessage';
import ThemeToggle from '../components/ThemeToggle';

export default function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setBusy(true); setError('');
    try { await login(email, password); nav('/'); }
    catch (err) { setError(errorMessage(err, 'Login failed')); }
    finally { setBusy(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Fraud Dashboard</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <button disabled={busy} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">{busy ? 'Signing in...' : 'Sign in'}</button>
        <p className="text-sm text-center">New here? <Link className="text-blue-600" to="/signup">Create an account</Link></p>
      </form>
      <footer className="absolute bottom-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Fraud Dashboard. All rights reserved.
      </footer>
    </div>
  );
}