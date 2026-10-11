require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Transaction = require('../models/Transaction');
const Case = require('../models/Case');
const { generate } = require('./dataGenerator');

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    await Promise.all([User.deleteMany({}), Transaction.deleteMany({}), Case.deleteMany({})]);
    await User.create([
      { name: 'Admin', email: 'admin@demo.com', password: 'Admin@12345', role: 'admin' },
      { name: 'Analyst', email: 'analyst@demo.com', password: 'Analyst@12345', role: 'analyst' },
    ]);
    const txns = generate(10000);
    await Transaction.insertMany(txns, { ordered: false });
    const high = txns.filter((t) => t.riskLevel === 'high').length;
    console.log(`Seeded ${txns.length} transactions, ${high} high risk`);
    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err.message);
    process.exit(1);
  }
})();