const { Readable } = require('stream');
const csv = require('csv-parser');
const { z } = require('zod');
const Transaction = require('../models/Transaction');
const { scoreTransaction } = require('../riskEngine');
const asyncHandler = require('../utils/asyncHandler');

exports.list = asyncHandler(async (req, res) => {
  const page = Math.max(1, parseInt(req.query.page) || 1);
  const limit = Math.min(100, parseInt(req.query.limit) || 20);
  const q = {};
  if (['low', 'medium', 'high'].includes(req.query.riskLevel)) q.riskLevel = req.query.riskLevel;
  if (typeof req.query.search === 'string' && req.query.search.trim()) {
    const s = req.query.search.trim();
    q.$or = [{ transactionId: s }, { customerId: s }];
  }
  if (req.query.from || req.query.to) {
    q.timestamp = {};
    if (req.query.from) q.timestamp.$gte = new Date(req.query.from);
    if (req.query.to) q.timestamp.$lte = new Date(req.query.to);
  }
  const [items, total] = await Promise.all([
    Transaction.find(q).sort({ timestamp: -1 }).skip((page - 1) * limit).limit(limit).lean(),
    Transaction.countDocuments(q),
  ]);
  res.json({ items, total, page, pages: Math.ceil(total / limit) });
});

exports.getOne = asyncHandler(async (req, res) => {
  const t = await Transaction.findById(req.params.id).lean();
  if (!t) return res.status(404).json({ message: 'Not found' });
  res.json(t);
});

const rowSchema = z.object({
  transactionId: z.string().min(1), customerId: z.string().min(1),
  amount: z.coerce.number().nonnegative(), category: z.string().optional(),
  merchant: z.string().optional(), country: z.string().optional(), deviceId: z.string().optional(),
  status: z.enum(['success', 'failed']).default('success'), timestamp: z.coerce.date(),
});

exports.upload = asyncHandler(async (req, res) => {
  if (!req.file) return res.status(400).json({ message: 'CSV file required' });
  const rows = [];
  await new Promise((resolve, reject) =>
    Readable.from(req.file.buffer).pipe(csv()).on('data', (r) => rows.push(r)).on('end', resolve).on('error', reject));
  if (rows.length > 5000) return res.status(400).json({ message: 'Max 5000 rows per upload' });

  const valid = [], errors = [];
  rows.forEach((r, i) => {
    const p = rowSchema.safeParse(r);
    p.success ? valid.push(p.data) : errors.push({ row: i + 2 });
  });

  // Load each customer's existing history once
  const ids = [...new Set(valid.map((v) => v.customerId))];
  const existing = await Transaction.find({ customerId: { $in: ids } }).sort({ timestamp: 1 }).lean();
  const hist = {};
  existing.forEach((t) => (hist[t.customerId] ||= []).push(t));

  valid.sort((a, b) => a.timestamp - b.timestamp);
  const docs = valid.map((t) => {
    const h = (hist[t.customerId] ||= []);
    const scored = { ...t, ...scoreTransaction(t, h.slice(-50)) };
    h.push(t);
    return scored;
  });
  await Transaction.insertMany(docs, { ordered: false });
  res.status(201).json({ imported: docs.length, rejected: errors.length, errors: errors.slice(0, 20) });
});