const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const adminRequestSchema = new mongoose.Schema({
    user: {
        userId: {
            type: String,
            required: true
        },
        username: {
            type: String,
            required: true
        },
        email: {
            type: String,
            required: true,
            unique: true
        }
    },
    status: {
        type: String,
        default: "running", // "running" || "approved" || "rejected"
        required: true
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("AdminRequest", adminRequestSchema);
