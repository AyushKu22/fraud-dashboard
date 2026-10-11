const { scoreTransaction } = require('../riskEngine');

const base = { amount: 100, country: 'IN', deviceId: 'd1', category: 'grocery', status: 'success', timestamp: '2026-01-10T12:00:00Z' };
const history = [1, 2, 3].map((i) => ({ ...base, amount: 100, timestamp: `2026-01-0${i}T12:00:00Z` }));

test('normal transaction is low risk', () => {
  expect(scoreTransaction(base, history).riskLevel).toBe('low');
});

test('huge amount is flagged', () => {
  const r = scoreTransaction({ ...base, amount: 5000 }, history);
  expect(r.triggeredRules).toContain('HIGH_AMOUNT');
});

test('new device + foreign country + high amount becomes high risk', () => {
  const r = scoreTransaction({ ...base, amount: 5000, country: 'RU', deviceId: 'x9', category: 'crypto' }, history);
  expect(r.riskLevel).toBe('high');
});

test('velocity rule fires on a burst of transactions in 10 minutes', () => {
  const burst = [0, 1, 2, 3].map((i) => ({ ...base, timestamp: `2026-01-10T12:0${i}:00Z` }));
  expect(scoreTransaction({ ...base, timestamp: '2026-01-10T12:05:00Z' }, burst).triggeredRules).toContain('VELOCITY');
});