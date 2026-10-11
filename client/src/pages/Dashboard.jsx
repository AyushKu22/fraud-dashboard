import { useEffect, useState } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, BarChart, Bar } from 'recharts';
import api from '../services/api';

const Card = ({ label, value }) => (
  <div className="bg-white rounded-lg shadow p-3 sm:p-4">
    <p className="text-xs sm:text-sm text-gray-500">{label}</p>
    <p className="text-xl sm:text-2xl font-bold">{value}</p>
  </div>
);

export default function Dashboard() {
  const [summary, setSummary] = useState(null);
  const [trends, setTrends] = useState([]);
  const [rules, setRules] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([api.get('/analytics/summary'), api.get('/analytics/trends'), api.get('/analytics/rules')])
      .then(([s, t, r]) => { setSummary(s.data); setTrends(t.data); setRules(r.data); })
      .catch(() => setError('Failed to load dashboard'));
  }, []);

  if (error) return <p className="p-4 sm:p-6 text-red-600">{error}</p>;
  if (!summary) return <p className="p-4 sm:p-6">Loading...</p>;

  return (
    <div className="p-4 sm:p-6 space-y-4 sm:space-y-6">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <Card label="Total transactions" value={summary.total.toLocaleString()} />
        <Card label="High-risk flagged" value={summary.flagged.toLocaleString()} />
        <Card label="Flag rate" value={`${summary.flaggedRate}%`} />
        <Card label="Open cases" value={summary.openCases} />
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="font-semibold mb-2">Last 30 days: flagged transactions</h2>
        <ResponsiveContainer width="100%" height={260}>
          <LineChart data={trends} margin={{ left: -15, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" tickFormatter={(d) => d.slice(5)} minTickGap={24} tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip />
            <Line type="monotone" dataKey="flagged" stroke="#dc2626" dot={false} />
            <Line type="monotone" dataKey="total" stroke="#2563eb" dot={false} />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="bg-white rounded-lg shadow p-3 sm:p-4">
        <h2 className="font-semibold mb-2">Most triggered rules</h2>
        <ResponsiveContainer width="100%" height={Math.max(200, rules.length * 38)}>
          <BarChart data={rules} layout="vertical" margin={{ left: 0, right: 10 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis type="number" tick={{ fontSize: 11 }} />
            <YAxis type="category" dataKey="rule" width={130} tick={{ fontSize: 11 }} />
            <Tooltip />
            <Bar dataKey="count" fill="#7c3aed" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}