const mongoose = require('mongoose');
const { z } = require('zod');
const Case = require('../models/Case');
const Transaction = require('../models/Transaction');
const asyncHandler = require('../utils/asyncHandler');

const STATUSES = ['open', 'under_review', 'fraud', 'legit'];

// A bad ID in the URL would otherwise crash with a 500
const validId = (req, res, next) =>
  mongoose.isValidObjectId(req.params.id) ? next() : res.status(404).json({ message: 'Not found' });
exports.validId = validId;

// Open a case from a transaction. If one already exists, return it so the app can just open it.
exports.create = asyncHandler(async (req, res) => {
  const { transactionId } = z.object({ transactionId: z.string().length(24) }).parse(req.body);
  if (!(await Transaction.exists({ _id: transactionId }))) return res.status(404).json({ message: 'Transaction not found' });

  const existing = await Case.findOne({ transaction: transactionId });
  if (existing) return res.status(200).json(existing);

  const c = await Case.create({
    transaction: transactionId,
    assignedTo: req.user._id,
    history: [{ by: req.user._id, action: 'Case opened' }],
  });
  res.status(201).json(c);
});

exports.list = asyncHandler(async (req, res) => {
  const q = {};
  if (STATUSES.includes(req.query.status)) q.status = req.query.status;
  const cases = await Case.find(q).sort({ updatedAt: -1 }).limit(100)
    .populate('transaction', 'transactionId amount currency riskLevel riskScore')
    .populate('assignedTo', 'name')
    .lean();
  res.json(cases);
});

exports.getOne = asyncHandler(async (req, res) => {
  const c = await Case.findById(req.params.id)
    .populate('transaction')
    .populate('assignedTo', 'name')
    .populate('notes.author', 'name')
    .populate('history.by', 'name')
    .lean();
  if (!c) return res.status(404).json({ message: 'Not found' });
  res.json(c);
});

exports.updateStatus = asyncHandler(async (req, res) => {
  const { status } = z.object({ status: z.enum(STATUSES) }).parse(req.body);
  const c = await Case.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  if (c.status === status) return res.json(c);

  c.history.push({ by: req.user._id, action: `Status changed ${c.status} → ${status}` });
  c.status = status;
  c.resolvedAt = ['fraud', 'legit'].includes(status) ? new Date() : undefined;
  await c.save();
  res.json(c);
});

exports.addNote = asyncHandler(async (req, res) => {
  const { text } = z.object({ text: z.string().trim().min(1).max(2000) }).parse(req.body);
  const c = await Case.findById(req.params.id);
  if (!c) return res.status(404).json({ message: 'Not found' });
  c.notes.push({ author: req.user._id, text });
  c.history.push({ by: req.user._id, action: 'Note added' });
  await c.save();
  res.status(201).json(c);
});