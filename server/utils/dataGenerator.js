const { scoreTransaction } = require('../riskEngine');

const rnd = (n) => Math.floor(Math.random() * n);
const pick = (arr) => arr[rnd(arr.length)];
const CATS = ['grocery', 'electronics', 'fuel', 'dining', 'travel', 'gift_cards', 'crypto'];
const COUNTRIES = ['IN', 'US', 'GB', 'RU', 'NG', 'SG'];

exports.generate = (total = 10000, customerCount = 300) => {
  const customers = Array.from({ length: customerCount }, (_, i) => ({
    id: `CUST${String(i).padStart(4, '0')}`,
    country: 'IN',
    avg: 300 + rnd(3000),
    devices: [`dev-${i}-a`, `dev-${i}-b`],
  }));

  const now = Date.now();
  const raw = [];

  // Normal behaviour
  for (let i = 0; i < total; i++) {
    const c = pick(customers);
    raw.push({
      customerId: c.id, amount: Math.round(c.avg * (0.4 + Math.random() * 1.2)),
      merchant: `Merchant ${rnd(80)}`, category: pick(CATS.slice(0, 5)), country: c.country,
      deviceId: pick(c.devices), cardLast4: String(1000 + rnd(9000)),
      status: Math.random() < 0.04 ? 'failed' : 'success',
      timestamp: new Date(now - rnd(30 * 24 * 3600 * 1000)),
    });
  }

  // Injected fraud bursts (about 3% of volume)
  for (let b = 0; b < Math.floor(total * 0.03 / 6); b++) {
    const c = pick(customers);
    const start = now - rnd(29 * 24 * 3600 * 1000);
    const country = pick(COUNTRIES.slice(1));
    const device = `evil-${rnd(9999)}`;
    for (let k = 0; k < 6; k++) {
      raw.push({
        customerId: c.id, amount: c.avg * (4 + rnd(6)), merchant: `Merchant ${rnd(80)}`,
        category: pick(['gift_cards', 'crypto', 'electronics']), country, deviceId: device,
        cardLast4: String(1000 + rnd(9000)), status: 'success', timestamp: new Date(start + k * 60000),
      });
    }
  }

  // Score in time order so each transaction only sees the customer's PAST
  raw.sort((a, b) => a.timestamp - b.timestamp);
  const histories = {};
  return raw.map((t, i) => {
    const h = (histories[t.customerId] ||= []);
    const scored = { ...t, transactionId: `TXN${Date.now()}${i}`, ...scoreTransaction(t, h.slice(-50)) };
    h.push(t);
    return scored;
  });
};