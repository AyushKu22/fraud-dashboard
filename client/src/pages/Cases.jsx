import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';
import StatusBadge from '../components/StatusBadge';
import errorMessage from '../utils/errorMessage';
import money from '../utils/money';

export default function Cases() {
  const [cases, setCases] = useState([]);
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    let ignore = false;
    setLoading(true);
    api.get('/cases', { params: { status } })
      .then((r) => { if (!ignore) { setCases(r.data); setError(''); } })
      .catch((e) => { if (!ignore) setError(errorMessage(e, 'Failed to load cases')); })
      .finally(() => { if (!ignore) setLoading(false); });
    return () => { ignore = true; };
  }, [status]);

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <select className="border p-2 rounded w-full sm:w-auto" value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">All cases</option>
          <option value="open">Open</option>
          <option value="under_review">Under review</option>
          <option value="fraud">Fraud</option>
          <option value="legit">Legit</option>
        </select>
        {!loading && <span className="text-sm text-gray-500">{cases.length} case{cases.length === 1 ? '' : 's'}</span>}
      </div>

      {error && <p className="text-red-600">{error}</p>}

      {loading ? <p>Loading...</p> : cases.length === 0 ? (
        <p className="text-gray-500">No cases here yet. Open one from a transaction's detail page.</p>
      ) : (
        <div className="bg-white rounded-lg shadow divide-y">
          {cases.map((c) => (
            <Link
              key={c._id}
              to={`/cases/${c._id}`}
              className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 p-4 hover:bg-gray-50"
            >
              <div className="min-w-0">
                <p className="text-blue-600 font-medium break-all">{c.transaction?.transactionId || 'Unknown transaction'}</p>
                <p className="text-sm text-gray-500">
                  {c.transaction ? money(c.transaction) : ''} · Updated {new Date(c.updatedAt).toLocaleDateString()}
                </p>
              </div>
              <div className="flex items-center gap-3">
                {c.transaction && <RiskBadge level={c.transaction.riskLevel} score={c.transaction.riskScore} />}
                <StatusBadge status={c.status} />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}