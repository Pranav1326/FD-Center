const express = require('express');
const cors = require('cors');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5000;

// Database Connection
const db = require('./utils/db');

// Routes
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const walletRoute = require('./routes/wallet');
const fdRoute = require('./routes/fd');
const rateRoute = require('./routes/rate');

// User Routes
app.use('/api/user', userRoute);

// Wallet Routes
app.use('/api/wallet', walletRoute);

// FD Routes
app.use('/api/fd', fdRoute);

// Admin Routes
app.use('/api/admin', adminRoute);

// Admin Routes
app.use('/api/rate', rateRoute);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:5000`);
});