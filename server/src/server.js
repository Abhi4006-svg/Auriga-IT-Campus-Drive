require('dotenv').config();
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

// Connect Database then Start Server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`==================================================`);
    console.log(` ☕ BeanLedger Café Rewards API Server Running `);
    console.log(` 🚀 Listening on http://localhost:${PORT}`);
    console.log(`==================================================`);
  });
});
