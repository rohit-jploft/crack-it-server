"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const expertSchema = new mongoose_1.Schema({
    user: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    agency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    description: {
        type: String,
        require: true,
    },
    price: {
        type: Number,
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
const Expert = (0, mongoose_1.model)("Expert", expertSchema);
exports.default = Expert;
