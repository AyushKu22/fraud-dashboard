const LABEL = { open: 'Open', under_review: 'Under review', fraud: 'Fraud', legit: 'Legit' };
const STYLE = {
  open: 'border',
  under_review: 'bg-yellow-100 text-yellow-800',
  fraud: 'bg-red-100 text-red-800',
  legit: 'bg-green-100 text-green-800',
};

export default function StatusBadge({ status }) {
  return <span className={`px-2 py-1 rounded text-xs font-semibold whitespace-nowrap ${STYLE[status]}`}>{LABEL[status] || status}</span>;
}