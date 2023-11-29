"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const bookingPaymentSchema = new mongoose_1.Schema({
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
    },
    totalAmount: {
        type: Number,
    },
    discountAmount: {
        type: Number,
    },
    promoCode: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "PromoCode",
    },
    paymentObj: {
        type: Object
    },
    CommissionAmount: {
        type: Number,
    },
    grandTotal: {
        type: Number,
    },
    status: {
        type: String,
        enum: ["PAID", "UNPAID"],
        default: "UNPAID",
    },
}, { timestamps: true });
const BookingPayment = (0, mongoose_1.model)("BookingPayment", bookingPaymentSchema);
exports.default = BookingPayment;
