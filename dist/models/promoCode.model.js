"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
// Define the schema for Promo Code
const promoCodeSchema = new mongoose_1.Schema({
    code: {
        type: String,
        unique: true,
        required: true,
    },
    type: {
        type: String,
        required: true,
    },
    discountPercentage: {
        type: Number,
    },
    flatAmount: {
        type: Number,
    },
    expirationDate: {
        type: Date,
        required: true,
    },
    isActive: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    // Add other fields as needed
}, { timestamps: true });
// Create the Promo Code model
const PromoCode = (0, mongoose_1.model)("PromoCode", promoCodeSchema);
exports.default = PromoCode;
