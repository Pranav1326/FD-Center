const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
const rateSchema = new mongoose.Schema({
    interestRate: {
        type: Number,
        required: true,
    },
    months: {
        type: Number,
        required: true,
    },
    for: {
        type: String,
        required: true,
    },
    createdBy: {
        adminId: {
            type: String,
            required: true,
        },
        admin: {
            type: String,
            required: true,
        }
    },
    updatedBy: {
        adminId: {
            type: String,
            default: null
        },
        admin: {
            type: String,
            default: null
        }
    }
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Rate", rateSchema);
