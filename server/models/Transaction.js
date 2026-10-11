const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  transactionId: { type: String, required: true, unique: true },
  customerId: { type: String, required: true },
  amount: { type: Number, required: true, min: 0 },
  currency: { type: String, default: 'INR' },
  merchant: String,
  category: String,
  country: String,
  deviceId: String,
  cardLast4: String, // never store full card numbers
  status: { type: String, enum: ['success', 'failed'], default: 'success' },
  timestamp: { type: Date, required: true },
  riskScore: { type: Number, default: 0 },
  riskLevel: { type: String, enum: ['low', 'medium', 'high'], default: 'low' },
  triggeredRules: [String],
});

transactionSchema.index({ customerId: 1, timestamp: -1 });
transactionSchema.index({ riskLevel: 1, timestamp: -1 });
transactionSchema.index({ timestamp: -1 });

module.exports = mongoose.model('Transaction', transactionSchema);