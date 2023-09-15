const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    account: {
        type: String,
        default: "normal",
        required: true,
    },
    dateOfBirth: {
        type: Date,
    },
    Fd: {
        type: Array,
        default: [],
    },
    work: {
        type: String,
    },
    profilepic: {
        type: String,
        default: "",
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("User", userSchema);
