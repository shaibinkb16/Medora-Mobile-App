// server.js
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const {connectDB} = require('./config/db');

// Routes
const authRoutes = require('./routes/authRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const profileRouter = require('./routes/profile');
const recordRoutes = require('./routes/recordRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const predictionRoutes = require('./routes/predictionRoutes');
const periodRoutes = require('./routes/periodRoutes');
const adminRoutes = require('./routes/adminRoutes');
const superAdminRoutes = require('./routes/superAdminRoutes'); // <-- ✅ New
const reminderRoutes = require("./routes/reminderRoutes");



// Load environment variables from .env file
dotenv.config();

// Initialize Express app
const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors()); // Enable CORS for all routes
app.use(express.json()); // Parse JSON bodies

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/profile', profileRouter);
app.use('/api/records', recordRoutes);
app.use('/api', recommendationRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/predictions', predictionRoutes);
app.use('/api/period', periodRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/superadmin', superAdminRoutes); 
app.use("/api/reminders", reminderRoutes);


// Other superadmin subroutes like /dashboard, /notifications, etc


// Health check
app.get('/', (req, res) => {
  res.send('✅ Backend is running');
});

console.log('ENV:', process.env);

// Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`🚀 Server running on http://0.0.0.0:${PORT}`);
});
