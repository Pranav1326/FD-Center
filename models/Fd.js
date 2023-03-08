const mongoose = require("mongoose"); // Erase if already required

// Declare the Schema of the Mongo model
var fdSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
    },
    matureDate: {
        type: Date,
        required: true,
    },
    status: {
        type: String,
        required: true,
    },
}, { timestamps: true });

//Export the model
module.exports = mongoose.model("Fd", fdSchema);
