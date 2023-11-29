"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const refundSchema = new mongoose_1.Schema({
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
    },
    status: {
        type: String,
        enums: ["PENDING", "ACCEPTED", "REFUNDED"],
        default: "PENING"
    },
    amount: {
        type: Number,
    },
}, { timestamps: true });
const Refund = (0, mongoose_1.model)("Refund", refundSchema);
exports.default = Refund;
