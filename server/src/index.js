const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
require('dotenv').config();

const app = express();

app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: [
        'http://localhost:5173', 
        'http://localhost:5174', 
        process.env.CLIENT_URL // Vercel UI
    ].filter(Boolean),
    credentials: true
}));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/clients', require('./routes/clientRoutes'));
app.use('/api/vendors', require('./routes/vendorRoutes'));
app.use('/api/staff', require('./routes/staffRoutes'));
app.use('/api/bookings', require('./routes/bookingRoutes'));
app.use('/api/payments', require('./routes/paymentRoutes'));
app.use('/api/invoices', require('./routes/invoiceRoutes'));
// Core Architecture Added
app.use('/api/ai', require('./routes/aiRoutes'));
app.use('/api/finance', require('./routes/financeRoutes'));
app.use('/api/vendor-payments', require('./routes/vendorPaymentRoutes'));
app.use('/api/events', require('./routes/eventRoutes'));

// Basic health check
app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', message: 'ERP System API is running...' });
});

// Serve React Frontend in Production
const path = require('path');
const clientBuildPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientBuildPath));

app.use((req, res) => {
    res.sendFile(path.join(clientBuildPath, 'index.html'));
});
// Database connection
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/erp-system';

mongoose.connect(MONGO_URI)
    .then(() => {
        console.log('Connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
            // Initialize auto payment reminder scheduler
            const { initReminderScheduler } = require('./controllers/paymentReminderController');
            initReminderScheduler();
        });
    })
    .catch(err => {
        console.error('Database connection error:', err);
    });
