const mongoose = require('mongoose');

const caseSchema = new mongoose.Schema({
  transaction: { type: mongoose.Schema.Types.ObjectId, ref: 'Transaction', required: true, unique: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, enum: ['open', 'under_review', 'fraud', 'legit'], default: 'open' },
  notes: [{ author: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, text: String, createdAt: { type: Date, default: Date.now } }],
  // Audit trail: who did what, when
  history: [{ by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, action: String, at: { type: Date, default: Date.now } }],
  resolvedAt: Date,
}, { timestamps: true });

module.exports = mongoose.model('Case', caseSchema);