const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const adminSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String
    },
    otp: {
        type: String,
        default: null
    },
    validated: {
        type: Boolean,
        default: false
    },
    active: {
        type: Boolean,
        default: false,
        required: true
    },
    ratesCreated: {
        type: Array,
        default: [],
        required: true
    },
    adminStatus: {
        type: String,
        default: "temporary",
        required: true
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Admin", adminSchema);
