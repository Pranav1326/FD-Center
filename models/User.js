const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var userSchema = new mongoose.Schema({
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
    accout: {
        type: String,
    },
    Fd: {
        type: Array,
        default: [],
    },
    work: {
        type: String,
    }
});

//Export the model
module.exports = mongoose.model("User", userSchema);
