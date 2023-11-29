"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const agencySchema = new mongoose_1.Schema({
    agency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        require: true,
    },
    languages: [String],
    jobCategory: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
    },
    experience: {
        type: Number,
        require: true,
    },
    expertise: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: "Category",
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Agency = (0, mongoose_1.model)("Agency", agencySchema);
exports.default = Agency;
