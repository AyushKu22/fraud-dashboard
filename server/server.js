require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

(async () => {
  try {
    await connectDB();
    const port = process.env.PORT || 5000;
    const server = app.listen(port, () => console.log(`Server running on port ${port}`));
    // Graceful shutdown: let in-flight requests finish
    process.on('SIGTERM', () => server.close(() => process.exit(0)));
  } catch (err) {
    console.error('Startup failed:', err.message);
    process.exit(1);
  }
})();