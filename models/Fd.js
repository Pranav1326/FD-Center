const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var fdSchema = new mongoose.Schema({
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
    amount: {
        type: Number,
        required: true,
    },
    months: {
        type: Number
    },
    matureDate: {
        type: Date,
        required: true,
    },
    interest: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        required: true,
        default: "running",
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Fd", fdSchema);
