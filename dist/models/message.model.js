"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const messageSchema = new mongoose_1.Schema({
    chat: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
    },
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    type: {
        type: String,
        default: 'text'
    },
    content: {
        type: String,
        required: true,
    },
    media: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    // Define other fields here
}, { timestamps: true });
const Message = (0, mongoose_1.model)('Message', messageSchema);
exports.default = Message;
