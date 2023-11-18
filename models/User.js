const mongoose = require("mongoose");

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    otp: {
        type: String,
        default: null
    },
    active: {
        type: Boolean,
        default: false,
        required: true
    },
    account: {
        type: String,
        default: "normal",
        required: true
    },
    dateOfBirth: {
        type: Date
    },
    Fd: {
        type: Array,
        default: []
    },
    work: {
        type: String
    },
    profilepic: {
        type: String,
        default: ""
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("User", userSchema);
