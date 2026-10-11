require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const mongoSanitize = require('express-mongo-sanitize');
const errorHandler = require('./middleware/errorHandler');

const app = express();
app.set('trust proxy', 1);

app.use(helmet());
app.use(cors({ origin: process.env.CLIENT_URL || 'http://localhost:5173' }));
app.use(express.json({ limit: '100kb' }));
app.use(mongoSanitize());
if (process.env.NODE_ENV !== 'test') app.use(morgan('dev'));

app.use('/api/auth/signup', rateLimit({ windowMs: 60 * 60 * 1000, max: 10, message: { message: 'Too many signups, try again later' } }));
app.delete('/api/auth/me', rateLimit({ windowMs: 15 * 60 * 1000, max: 5, message: { message: 'Too many attempts' } }));

app.get('/health', (req, res) => res.json({ status: 'ok' }));
app.use('/api/auth', require('./routes/authRoutes'));                 // enabled in Step 13
app.use('/api/transactions', require('./routes/transactionRoutes'));  // Week 2
app.use('/api/cases', require('./routes/caseRoutes'));                // Week 4
app.use('/api/analytics', require('./routes/analyticsRoutes'));       // Week 2

app.use(errorHandler);
module.exports = app;