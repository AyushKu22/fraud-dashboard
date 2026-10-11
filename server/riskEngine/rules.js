const HIGH_RISK_CATEGORIES = ['gift_cards', 'crypto', 'wire_transfer'];
const minutes = (a, b) => Math.abs(new Date(a) - new Date(b)) / 60000;

exports.highAmount = (t, h) => {
  if (h.length < 3) return null;
  const avg = h.reduce((s, x) => s + x.amount, 0) / h.length;
  return t.amount > avg * 3 ? { name: 'HIGH_AMOUNT', points: 25 } : null;
};

exports.velocity = (t, h) => {
  const recent = h.filter((x) => new Date(x.timestamp) <= new Date(t.timestamp) && minutes(x.timestamp, t.timestamp) <= 10);
  return recent.length >= 4 ? { name: 'VELOCITY', points: 30 } : null;
};

exports.locationMismatch = (t, h) => {
  if (h.length < 3) return null;
  const counts = {};
  h.forEach((x) => (counts[x.country] = (counts[x.country] || 0) + 1));
  const usual = Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0];
  return t.country && t.country !== usual ? { name: 'LOCATION_MISMATCH', points: 20 } : null;
};

exports.repeatedFailures = (t, h) => {
  const last3 = [...h].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)).slice(0, 3);
  return t.status === 'success' && last3.length === 3 && last3.every((x) => x.status === 'failed')
    ? { name: 'REPEATED_FAILURES', points: 25 } : null;
};

exports.newDevice = (t, h) =>
  h.length >= 3 && t.deviceId && !h.some((x) => x.deviceId === t.deviceId) ? { name: 'NEW_DEVICE', points: 15 } : null;

exports.oddHours = (t) => {
  const hr = new Date(t.timestamp).getUTCHours();
  return hr >= 1 && hr < 4 ? { name: 'ODD_HOURS', points: 10 } : null;
};

exports.highRiskMerchant = (t) =>
  HIGH_RISK_CATEGORIES.includes(t.category) ? { name: 'HIGH_RISK_MERCHANT', points: 15 } : null;