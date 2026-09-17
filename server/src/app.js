const express = require('express');
const cors = require('cors');
const { errorHandler, notFound } = require('./middleware/errorMiddleware');

const authRoutes = require('./routes/authRoutes');
const memberRoutes = require('./routes/memberRoutes');
const rewardRoutes = require('./routes/rewardRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const clockRoutes = require('./routes/clockRoutes');
const outboxRoutes = require('./routes/outboxRoutes');

const app = express();

// Body Parser & CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// API Health Check
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'BeanLedger API Server Running',
    timestamp: new Date().toISOString(),
  });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/members', memberRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Twist Endpoints (Level 2: Clock API & Level 3: Outbox Notifications)
app.use('/api/clock', clockRoutes);
app.use('/clock', clockRoutes);

app.use('/api/outbox', outboxRoutes);
app.use('/outbox', outboxRoutes);

// Error Handling Middlewares
app.use(notFound);
app.use(errorHandler);

module.exports = app;
