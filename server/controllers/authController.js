const jwt = require('jsonwebtoken');
const { z } = require('zod');
const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

const sign = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES || '1d' });
const publicUser = (u) => ({ id: u._id, name: u.name, email: u.email, role: u.role });

const email = z.string().trim().toLowerCase().email();
const strongPassword = z.string().min(8).max(72)
  .regex(/[A-Za-z]/, 'Password needs at least one letter')
  .regex(/\d/, 'Password needs at least one number');

// Public signup: anyone can create an ANALYST account (role is never read from the request)
exports.signup = asyncHandler(async (req, res) => {
  const data = z.object({
    name: z.string().trim().min(2).max(50),
    email,
    password: strongPassword,
  }).parse(req.body);
  const user = await User.create({ ...data, role: 'analyst' });
  res.status(201).json({ token: sign(user._id), user: publicUser(user) });
});

// Admin-only: create any role, including admins
exports.register = asyncHandler(async (req, res) => {
  const data = z.object({
    name: z.string().trim().min(2).max(50),
    email,
    password: strongPassword,
    role: z.enum(['admin', 'analyst']).optional(),
  }).parse(req.body);
  const user = await User.create(data);
  res.status(201).json(publicUser(user));
});

exports.login = asyncHandler(async (req, res) => {
  const { email: e, password } = z.object({ email, password: z.string().min(1) }).parse(req.body);
  const user = await User.findOne({ email: e }).select('+password');
  // Same message for both failures, so attackers can't tell which was wrong
  if (!user || !(await user.matches(password))) return res.status(401).json({ message: 'Invalid credentials' });
  res.json({ token: sign(user._id), user: publicUser(user) });
});

exports.me = (req, res) => res.json(publicUser(req.user));

// Delete your own account (password required)
exports.deleteMe = asyncHandler(async (req, res) => {
  const { password } = z.object({ password: z.string().min(1) }).parse(req.body);
  const user = await User.findById(req.user._id).select('+password');
  // 403, not 401: the client auto-logs-out on 401, and a typo should not do that
  if (!(await user.matches(password))) return res.status(403).json({ message: 'Incorrect password' });
  if (user.role === 'admin' && (await User.countDocuments({ role: 'admin' })) <= 1) {
    return res.status(400).json({ message: 'You are the only admin. Create another admin first.' });
  }
  await user.deleteOne();
  res.json({ message: 'Account deleted' });
});