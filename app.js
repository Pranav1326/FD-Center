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
const { json } = require('express');

// User Routes
app.use('/api/user', userRoute);

// Admin Routes
// app.use('/api/admin', adminRoute);

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:5000`);
});