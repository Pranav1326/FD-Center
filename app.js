const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

app.use(cors());

// Database Connection
const db = require('./utils/db');

// Routes
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const walletRoute = require('./routes/wallet');
const fdRoute = require('./routes/fd');
const rateRoute = require('./routes/rate');
const transactionRoute = require('./routes/transaction');
const superAdminRoute = require('./routes/superadmin');

// User Routes
app.use('/api/user', userRoute);

// Wallet Routes
app.use('/api/wallet', walletRoute);

// FD Routes
app.use('/api/fd', fdRoute);

// Admin Routes
app.use('/api/admin', adminRoute);

// Superadmin Routes
app.use('/api/superadmin', superAdminRoute);

// Admin Routes
app.use('/api/rate', rateRoute);

// Transaction Routes
app.use('/api/transaction', transactionRoute);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});