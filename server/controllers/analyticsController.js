const Transaction = require('../models/Transaction');
const Case = require('../models/Case');
const asyncHandler = require('../utils/asyncHandler');

exports.summary = asyncHandler(async (req, res) => {
  const [total, flagged, openCases, confirmedFraud] = await Promise.all([
    Transaction.estimatedDocumentCount(),
    Transaction.countDocuments({ riskLevel: 'high' }),
    Case.countDocuments({ status: { $in: ['open', 'under_review'] } }),
    Case.countDocuments({ status: 'fraud' }),
  ]);
  res.json({ total, flagged, openCases, confirmedFraud, flaggedRate: total ? +((flagged / total) * 100).toFixed(2) : 0 });
});

exports.trends = asyncHandler(async (req, res) => {
  const data = await Transaction.aggregate([
    { $match: { timestamp: { $gte: new Date(Date.now() - 30 * 24 * 3600 * 1000) } } },
    { $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$timestamp' } },
        total: { $sum: 1 },
        flagged: { $sum: { $cond: [{ $eq: ['$riskLevel', 'high'] }, 1, 0] } },
    } },
    { $sort: { _id: 1 } },
    { $project: { _id: 0, date: '$_id', total: 1, flagged: 1 } },
  ]);
  res.json(data);
});

exports.rules = asyncHandler(async (req, res) => {
  res.json(await Transaction.aggregate([
    { $unwind: '$triggeredRules' },
    { $group: { _id: '$triggeredRules', count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $project: { _id: 0, rule: '$_id', count: 1 } },
  ]));
});