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

// User Routes
app.use('/api/user', userRoute);

// Wallet Routes
app.use('/api/wallet', walletRoute);

// Admin Routes
// app.use('/api/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:5000`);
});