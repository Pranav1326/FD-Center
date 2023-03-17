const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const transactionSchema = new mongoose.Schema({
    user: {
        userId: {
            type: String,
            required: true,
        },
        username: {
            type: String,
            required: true,
        }
    },
    transaction: {
        type: String,
        required: true,
    },
    amount: {
        type: Number,
        required: true,
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Transaction", transactionSchema);
