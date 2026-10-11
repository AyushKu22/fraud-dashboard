import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import errorMessage from '../utils/errorMessage';
import money from '../utils/money';

export default function CaseDetail() {
  const { id } = useParams();
  const [c, setC] = useState(null);
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [missing, setMissing] = useState(false);
  const [busy, setBusy] = useState(false);

  const load = () =>
    api.get(`/cases/${id}`)
      .then((r) => { setC(r.data); setError(''); })
      .catch((e) => (e.response?.status === 404 ? setMissing(true) : setError(errorMessage(e, 'Failed to load case'))));

  useEffect(() => { load(); }, [id]);

  const changeStatus = async (status) => {
    setBusy(true); setError('');
    try { await api.patch(`/cases/${id}`, { status }); await load(); }
    catch (e) { setError(errorMessage(e, 'Could not update status')); }
    finally { setBusy(false); }
  };

  const addNote = async (e) => {
    e.preventDefault();
    if (!note.trim()) return;
    setBusy(true); setError('');
    try { await api.post(`/cases/${id}/notes`, { text: note }); setNote(''); await load(); }
    catch (err) { setError(errorMessage(err, 'Could not add note')); }
    finally { setBusy(false); }
  };

  if (missing) return (
    <div className="p-4 sm:p-6 space-y-2">
      <p>Case not found.</p>
      <Link className="text-blue-600" to="/cases">Back to cases</Link>
    </div>
  );
  if (!c) return <p className="p-4 sm:p-6">{error || 'Loading...'}</p>;

  const t = c.transaction;
  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-4">
      <Link className="text-blue-600 text-sm" to="/cases">← All cases</Link>

      <div className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          {t ? (
            <Link className="text-blue-600 text-lg font-bold break-all" to={`/transactions/${t._id}`}>{t.transactionId}</Link>
          ) : <span className="font-bold">Unknown transaction</span>}
          {t && <RiskBadge level={t.riskLevel} score={t.riskScore} />}
          <StatusBadge status={c.status} />
        </div>

        {t && (
          <p className="text-sm break-words">
            {money(t)} · {t.category} · {t.country}
            <br />
            Rules fired: {t.triggeredRules?.length ? t.triggeredRules.join(', ') : 'none'}
          </p>
        )}
        <p className="text-sm text-gray-500">Assigned to: {c.assignedTo?.name || 'Deleted user'}</p>

        <label className="flex flex-col sm:flex-row sm:items-center gap-2 text-sm">
          <span>Change status</span>
          <select
            className="border p-2 rounded"
            value={c.status}
            disabled={busy}
            onChange={(e) => changeStatus(e.target.value)}
          >
            <option value="open">Open</option>
            <option value="under_review">Under review</option>
            <option value="fraud">Fraud</option>
            <option value="legit">Legit</option>
          </select>
        </label>
      </div>

      {error && <p className="text-red-600">{error}</p>}

      <div className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <h2 className="font-semibold">Investigation notes</h2>
        {c.notes.length === 0 && <p className="text-sm text-gray-500">No notes yet.</p>}
        {c.notes.map((n, i) => (
          <div key={i} className="border-l-4 pl-3 text-sm break-words">
            <p><b>{n.author?.name || 'Deleted user'}</b> <span className="text-gray-500">· {new Date(n.createdAt).toLocaleString()}</span></p>
            <p>{n.text}</p>
          </div>
        ))}
        <form onSubmit={addNote} className="flex flex-col sm:flex-row gap-2">
          <input
            className="flex-1 border p-2 rounded min-w-0"
            value={note}
            maxLength={2000}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add a note..."
          />
          <button disabled={busy || !note.trim()} className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50">Add note</button>
        </form>
      </div>

      <div className="bg-white rounded-lg shadow p-4 sm:p-5">
        <h2 className="font-semibold mb-2">Audit trail</h2>
        <ul className="text-sm text-gray-600 space-y-1">
          {c.history.map((h, i) => (
            <li key={i} className="break-words">{new Date(h.at).toLocaleString()} · {h.by?.name || 'Deleted user'} · {h.action}</li>
          ))}
        </ul>
      </div>
    </div>
  );
}