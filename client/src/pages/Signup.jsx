import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import errorMessage from '../utils/errorMessage';
import ThemeToggle from '../components/ThemeToggle';

export default function Signup() {
  const { signup } = useAuth();
  const nav = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', confirm: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  const submit = async (e) => {
    e.preventDefault(); setError('');
    if (form.password !== form.confirm) return setError('Passwords do not match');
    setBusy(true);
    try { await signup(form.name, form.email, form.password); nav('/'); }
    catch (err) { setError(errorMessage(err, 'Signup failed')); }
    finally { setBusy(false); }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <div className="absolute top-4 right-4"><ThemeToggle /></div>

      <form onSubmit={submit} className="bg-white p-8 rounded-lg shadow w-full max-w-sm space-y-4">
        <h1 className="text-2xl font-bold text-center">Create account</h1>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded" placeholder="Full name" value={form.name} onChange={set('name')} required />
        <input className="w-full border p-2 rounded" type="email" placeholder="Email" value={form.email} onChange={set('email')} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Password" value={form.password} onChange={set('password')} required />
        <input className="w-full border p-2 rounded" type="password" placeholder="Confirm password" value={form.confirm} onChange={set('confirm')} required />
        <p className="text-xs text-gray-500">At least 8 characters, with a letter and a number.</p>
        <button disabled={busy} className="w-full bg-blue-600 text-white p-2 rounded disabled:opacity-50">{busy ? 'Creating...' : 'Sign up'}</button>
        <p className="text-sm text-center">Already have an account? <Link className="text-blue-600" to="/login">Log in</Link></p>
      </form>
      <footer className="absolute bottom-4 text-center text-sm text-gray-500">
        © {new Date().getFullYear()} Fraud Dashboard. All rights reserved.
      </footer>
    </div>
  );
}