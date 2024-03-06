const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerFile = require('./swagger-output.json');
const cron = require('node-cron');

const app = express();
app.use(express.json());
const PORT = process.env.PORT || 5050;

app.use(cors());

// Database Connection
const db = require('./utils/db');

// Fd maturity check
const {checkMaturedDeposits} = require('./utils/fdChecker');

cron.schedule('0 0 * * *', () => {
    checkMaturedDeposits();
}, {
    timezone: 'Asia/Kolkata'
});

// Routes
const userRoute = require('./routes/user');
const adminRoute = require('./routes/admin');
const walletRoute = require('./routes/wallet');
const fdRoute = require('./routes/fd');
const rateRoute = require('./routes/rate');
const transactionRoute = require('./routes/transaction');
const superAdminRoute = require('./routes/superadmin');

// User Routes
app.use('/api/user', userRoute
// #swagger.tags = ["User"]
);

// Wallet Routes
app.use('/api/wallet', walletRoute
// #swagger.tags = ["Wallet"]
);

// FD Routes
app.use('/api/fd', fdRoute
// #swagger.tags = ["Fd"]
);

// Admin Routes
app.use('/api/admin', adminRoute
// #swagger.tags = ["Admin"]
);

// Superadmin Routes
app.use('/api/superadmin', superAdminRoute
// #swagger.tags = ["SuperAdmin"]
);

// Admin Routes
app.use('/api/rate', rateRoute
// #swagger.tags = ["Rate"]
);

// Transaction Routes
app.use('/api/transaction', transactionRoute
// #swagger.tags = ["Transaction"]
);

// Documentation
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerFile));

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:${PORT}`);
});