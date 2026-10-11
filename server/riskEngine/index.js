const rules = require('./rules');

exports.scoreTransaction = (txn, history = []) => {
  const hits = Object.values(rules).map((rule) => rule(txn, history)).filter(Boolean);
  const riskScore = Math.min(100, hits.reduce((s, r) => s + r.points, 0));
  const riskLevel = riskScore >= 70 ? 'high' : riskScore >= 40 ? 'medium' : 'low';
  return { riskScore, riskLevel, triggeredRules: hits.map((r) => r.name) };
};