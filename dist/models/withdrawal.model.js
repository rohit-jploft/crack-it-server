"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const withdrawalRequestSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User", // Reference to the user who made the request
    },
    amount: {
        type: Number,
        required: true,
    },
    bank: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Bank",
    },
    status: {
        type: String,
        enum: ["Pending", "Approved", "Rejected"],
        default: "Pending",
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, { timestamps: true });
const WithdrawalRequest = (0, mongoose_1.model)("WithdrawalRequest", withdrawalRequestSchema);
exports.default = WithdrawalRequest;
