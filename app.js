const express = require('express');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.status(200).json("Home route");
});

app.listen(PORT, () => {
    console.log(`Server started on http://localhost:5000`);
});