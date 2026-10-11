module.exports = (err, req, res, next) => {
  console.error(err);
  if (err.name === 'ZodError') return res.status(400).json({ message: 'Validation failed', errors: err.issues });
  if (err.code === 11000) return res.status(409).json({ message: 'Already exists' });
  res.status(err.status || 500).json({ message: err.status ? err.message : 'Server error' });
};