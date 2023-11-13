const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const superAdminSchema = new mongoose.Schema({
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
        type: String,
        required: true
    },
    requests: {
        type: Array,
        default: [],
        required: true
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("SuperAdmin", superAdminSchema);
