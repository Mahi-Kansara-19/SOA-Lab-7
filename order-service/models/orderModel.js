const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        productId: {
            type: mongoose.Schema.Types.ObjectId,
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        }
    },
    {
        timestamps: true
    }
);

module.exports = mongoose.model("Order", orderSchema);