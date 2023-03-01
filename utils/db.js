const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

mongoose.connect(`mongodb+srv://${process.env.MONGO_PROFILE}:${process.env.MONGO_PASSWORD}@cluster0.zrbj1sm.mongodb.net/fd?retryWrites=true&w=majority`)
.then(() => {
    console.log(`MongoDB Connected!`)
})
.catch(err => {
    console.log(`Error connecting to mongodb : `, err);
});