"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.payWithWallet = exports.bankValidationSchema = exports.promoCodeSchema = void 0;
const Joi = require("joi").extend(require("@joi/date"));
// Define the Joi schema for a Promo Code
exports.promoCodeSchema = Joi.object({
    code: Joi.string().required(),
    type: Joi.string().valid("PERCENT", "FLAT").required(),
    discountPercentage: Joi.number()
        .allow("")
        .when("type", { is: "PERCENT", then: Joi.required() })
        .positive()
        .max(100),
    flatAmount: Joi.number()
        .allow("")
        .when("type", { is: "FLAT", then: Joi.required() }),
    expirationDate: Joi.date().format("YYYY-MM-DD").required(),
    // Add other fields as needed
});
const withdrawalRequestSchema = Joi.object({
    user: Joi.string().required(),
    bank: Joi.string().required(),
    amount: Joi.number().positive().required(),
    status: Joi.string()
        .valid("Pending", "Approved", "Rejected")
        .default("Pending"),
});
// Joi validation schema for BankData
exports.bankValidationSchema = Joi.object({
    user: Joi.string().required(),
    type: Joi.string().valid("BANK", "UPI").required(),
    bankName: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
    accountName: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
    accountNo: Joi.number().when("type", { is: "BANK", then: Joi.required() }),
    ifscCode: Joi.string().when("type", { is: "BANK", then: Joi.required() }),
    upiId: Joi.string().when("type", { is: "UPI", then: Joi.required() }),
    isDeleted: Joi.boolean().default(false),
});
exports.payWithWallet = Joi.object({
    bookingId: Joi.string().required(),
    amount: Joi.number().required(),
    userId: Joi.string().required(),
});
exports.default = withdrawalRequestSchema;
