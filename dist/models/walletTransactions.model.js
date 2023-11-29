"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const walletTransactionSchema = new mongoose_1.Schema({
    amount: {
        type: Number,
    },
    type: {
        type: String,
        enums: ["CREDIT", "DEBIT"],
    },
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    otherUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    status: {
        type: String,
        enum: ['pending', 'success', 'failed'],
        default: 'success'
    },
    title: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const WalletTransaction = (0, mongoose_1.model)("WalletTransaction", walletTransactionSchema);
exports.default = WalletTransaction;
