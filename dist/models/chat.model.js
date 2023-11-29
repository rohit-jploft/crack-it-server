"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chatSchema = new mongoose_1.Schema({
    participants: [
        {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: "User",
        },
    ],
    admin: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    booking: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "Booking",
    },
    agency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    superAdmin: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User",
    },
    isClosed: {
        type: Boolean,
        default: false,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
    // Define other fields here
});
const Chat = (0, mongoose_1.model)("Chat", chatSchema);
exports.default = Chat;
