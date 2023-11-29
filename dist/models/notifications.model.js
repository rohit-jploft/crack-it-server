"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notificationSchema = new mongoose_1.Schema({
    sender: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    receiver: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
    },
    type: {
        type: String
    },
    title: String,
    message: String,
    data: {
        type: Object,
        default: {},
    },
    dynamicData: {
        type: Object,
        default: {},
    },
    isRead: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
notificationSchema.set('toJSON', {
    transform: (doc, ret, opt) => {
        delete ret.__v;
        return ret;
    },
});
const Notification = (0, mongoose_1.model)('Notification', notificationSchema);
exports.default = Notification;
