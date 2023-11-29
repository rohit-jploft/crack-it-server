"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const categorySchema = new mongoose_1.Schema({
    title: {
        type: String,
        require: true,
        index: true
    },
    parent: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Category",
    },
    image: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const Category = (0, mongoose_1.model)("Category", categorySchema);
exports.default = Category;
