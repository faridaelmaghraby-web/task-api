require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;

if (!process.env.JWT_SECRET) {
  console.error('JWT_SECRET is not defined. Set it in your environment or .env file.');
  process.exit(1);
}

connectDB()
  .then(() => app.listen(PORT, () => console.log(`Server listening on port ${PORT}`)))
  .catch((err) => {
    console.error('Failed to start server:', err.message);
    process.exit(1);
  });
