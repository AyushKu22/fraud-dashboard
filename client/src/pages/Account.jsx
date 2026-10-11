import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import errorMessage from '../utils/errorMessage';

export default function Account() {
  const { user, deleteAccount } = useAuth();
  const nav = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmText, setConfirmText] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const remove = async (e) => {
    e.preventDefault(); setError('');
    if (confirmText !== 'DELETE') return setError('Type DELETE to confirm');
    setBusy(true);
    try { await deleteAccount(password); nav('/login'); }
    catch (err) { setError(errorMessage(err, 'Could not delete account')); setBusy(false); }
  };

  return (
    <div className="p-4 sm:p-6 max-w-xl space-y-4 sm:space-y-6">
      <div className="bg-white rounded-lg shadow p-5 space-y-1">
        <h1 className="text-xl font-bold">My account</h1>
        <p>Name: {user.name}</p>
        <p>Email: {user.email}</p>
        <p>Role: {user.role}</p>
      </div>

      <form onSubmit={remove} className="bg-white rounded-lg shadow p-5 space-y-3 border border-red-200">
        <h2 className="font-semibold text-red-700">Delete account</h2>
        <p className="text-sm text-gray-600">This permanently deletes your login. It cannot be undone. Cases and notes you wrote stay in the audit trail.</p>
        {error && <p className="text-red-600 text-sm">{error}</p>}
        <input className="w-full border p-2 rounded" type="password" placeholder="Your password" value={password} onChange={(e) => setPassword(e.target.value)} required />
        <input className="w-full border p-2 rounded" placeholder='Type DELETE to confirm' value={confirmText} onChange={(e) => setConfirmText(e.target.value)} required />
        <button disabled={busy} className="w-full sm:w-auto bg-red-600 text-white px-4 py-2 rounded disabled:opacity-50">{busy ? 'Deleting...' : 'Delete my account'}</button>
      </form>
    </div>
  );
}