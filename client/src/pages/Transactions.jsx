import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';

export default function Transactions() {
  const [data, setData] = useState({ items: [], total: 0, pages: 1 });
  const [filters, setFilters] = useState({ riskLevel: '', search: '', page: 1 });
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    setLoading(true);
    api.get('/transactions', { params: filters })
      .then((r) => { setData(r.data); setError(''); })
      .catch((e) => setError(e.response?.data?.message || 'Failed to load'))
      .finally(() => setLoading(false));
  }, [filters]);

  const set = (patch) => setFilters((f) => ({ ...f, page: 1, ...patch }));
  const empty = !loading && data.items.length === 0;

  return (
    <div className="p-4 sm:p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3">
        <select className="border p-2 rounded w-full sm:w-auto" value={filters.riskLevel} onChange={(e) => set({ riskLevel: e.target.value })}>
          <option value="">All risk levels</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option>
        </select>
        <form onSubmit={(e) => { e.preventDefault(); set({ search: query.trim() }); }} className="flex gap-2 w-full sm:w-auto">
          <input className="border p-2 rounded flex-1 min-w-0" placeholder="Txn ID or Customer ID" value={query} onChange={(e) => setQuery(e.target.value)} />
          <button className="bg-blue-600 text-white px-4 rounded">Search</button>
        </form>
        <span className="text-sm text-gray-500">{data.total.toLocaleString()} results</span>
      </div>

      {error && <p className="text-red-600">{error}</p>}
      {empty && <p className="text-gray-500">No transactions found.</p>}

      <div className="hidden md:block bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-left"><tr>{['Txn', 'Customer', 'Amount', 'Country', 'Time', 'Risk'].map((h) => <th key={h} className="p-3">{h}</th>)}</tr></thead>
          <tbody>
            {loading ? <tr><td className="p-4" colSpan="6">Loading...</td></tr> : data.items.map((t) => (
              <tr key={t._id} className="border-t hover:bg-gray-50">
                <td className="p-3"><Link className="text-blue-600" to={`/transactions/${t._id}`}>{t.transactionId}</Link></td>
                <td className="p-3">{t.customerId}</td>
                <td className="p-3">₹{t.amount.toLocaleString()}</td>
                <td className="p-3">{t.country}</td>
                <td className="p-3">{new Date(t.timestamp).toLocaleString()}</td>
                <td className="p-3"><RiskBadge level={t.riskLevel} score={t.riskScore} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-3">
        {loading ? <p>Loading...</p> : data.items.map((t) => (
          <Link key={t._id} to={`/transactions/${t._id}`} className="block bg-white rounded-lg shadow p-4 space-y-1">
            <div className="flex justify-between items-start gap-2">
              <span className="text-blue-600 font-medium break-all">{t.transactionId}</span>
              <RiskBadge level={t.riskLevel} score={t.riskScore} />
            </div>
            <p className="text-sm">₹{t.amount.toLocaleString()} · {t.country}</p>
            <p className="text-xs text-gray-500">{t.customerId} · {new Date(t.timestamp).toLocaleString()}</p>
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <button disabled={filters.page <= 1} onClick={() => setFilters({ ...filters, page: filters.page - 1 })} className="border px-3 py-1 rounded disabled:opacity-40">Prev</button>
        <span>Page {filters.page} of {data.pages}</span>
        <button disabled={filters.page >= data.pages} onClick={() => setFilters({ ...filters, page: filters.page + 1 })} className="border px-3 py-1 rounded disabled:opacity-40">Next</button>
      </div>
    </div>
  );
}