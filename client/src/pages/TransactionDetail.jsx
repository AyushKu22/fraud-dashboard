import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../services/api';
import RiskBadge from '../components/RiskBadge';

const EXPLAIN = {
  HIGH_AMOUNT: 'Amount is more than 3x this customer’s average',
  VELOCITY: 'Several transactions within 10 minutes',
  LOCATION_MISMATCH: 'Country differs from customer’s usual country',
  REPEATED_FAILURES: 'Several failed attempts before this success',
  NEW_DEVICE: 'Device never seen for this customer',
  ODD_HOURS: 'Made between 1 AM and 4 AM (UTC)',
  HIGH_RISK_MERCHANT: 'Merchant category is high risk',
};

const Field = ({ label, value }) => (
  <div className="min-w-0">
    <p className="text-xs text-gray-500">{label}</p>
    <p className="break-words">{value}</p>
  </div>
);

export default function TransactionDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const [t, setT] = useState(null);
  const [msg, setMsg] = useState('');

  useEffect(() => { api.get(`/transactions/${id}`).then((r) => setT(r.data)).catch(() => setMsg('Not found')); }, [id]);

  const openCase = async () => {
    try { const { data } = await api.post('/cases', { transactionId: id }); nav(`/cases/${data._id}`); }
    catch (e) { setMsg(e.response?.data?.message || 'Could not open case'); }
  };

  if (!t) return <p className="p-4 sm:p-6">{msg || 'Loading...'}</p>;
  return (
    <div className="p-4 sm:p-6 max-w-3xl space-y-4">
      <div className="bg-white rounded-lg shadow p-4 sm:p-5 space-y-3">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-lg sm:text-xl font-bold break-all">{t.transactionId}</h1>
          <RiskBadge level={t.riskLevel} score={t.riskScore} />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <Field label="Customer" value={t.customerId} />
          <Field label="Amount" value={`₹${t.amount.toLocaleString()}`} />
          <Field label="Category" value={t.category} />
          <Field label="Country" value={t.country} />
          <Field label="Device" value={t.deviceId} />
          <Field label="Card" value={`**** ${t.cardLast4}`} />
          <Field label="Status" value={t.status} />
          <Field label="Time" value={new Date(t.timestamp).toLocaleString()} />
        </div>
      </div>
      <div className="bg-white rounded-lg shadow p-4 sm:p-5">
        <h2 className="font-semibold mb-2">Why this score?</h2>
        {t.triggeredRules.length === 0 ? <p className="text-gray-500">No rules triggered.</p> :
          <ul className="list-disc ml-5 space-y-1">{t.triggeredRules.map((r) => <li key={r}><b>{r}</b>: {EXPLAIN[r]}</li>)}</ul>}
      </div>
      {msg && <p className="text-red-600">{msg}</p>}
      <button onClick={openCase} className="w-full sm:w-auto bg-blue-600 text-white px-4 py-2 rounded">Open investigation case</button>
    </div>
  );
}