const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var walletSchema = new mongoose.Schema({
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
    money: {
        type: Number,
        required: true,
        default: 0,
        min: 0,
        max: 10000000
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Wallet", walletSchema);
