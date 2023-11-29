"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const commissionSchema = new mongoose_1.Schema({
    title: {
        type: String,
        require: true,
    },
    type: {
        type: String,
        enums: ["PERCENT", "FIXED"],
        require: true
    },
    percent: {
        type: Number
    },
    amount: {
        type: Number
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Commission = (0, mongoose_1.model)("Commission", commissionSchema);
exports.default = Commission;
