const colors = { low: 'bg-green-100 text-green-800', medium: 'bg-yellow-100 text-yellow-800', high: 'bg-red-100 text-red-800' };

export default function RiskBadge({ level, score }) {
  return <span className={`px-2 py-1 rounded text-xs font-semibold ${colors[level]}`}>{level.toUpperCase()} {score != null && `(${score})`}</span>;
}