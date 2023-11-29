"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const BankSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    accountName: String,
    accountNo: Number,
    bankName: String,
    ifscCode: String,
    type: {
        type: String,
        enum: ["BANK", "UPI"],
    },
    upiId: {
        type: String,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Bank = (0, mongoose_1.model)("Bank", BankSchema);
exports.default = Bank;
