"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.saveDeviceTokenInDb = exports.notificationReaded = exports.getAllNotificationsByUser = exports.createNotification = void 0;
const RequestHelper_1 = require("../../helper/RequestHelper");
const notifications_model_1 = __importDefault(require("../../models/notifications.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const notifications_1 = require("../../helper/notifications");
const notificationHelper_1 = require("../../helper/notificationHelper");
const pagination_1 = require("../../helper/pagination");
const createNotification = (sender, receiver, title, type, notificationType, message, data, dynamicData) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const notification = yield notifications_model_1.default.create({
            sender,
            receiver,
            title,
            type,
            message,
            data,
            dynamicData,
        });
        const getRecieverToken = yield (0, notificationHelper_1.getDeviceToken)(receiver, notificationType);
        console.log(getRecieverToken, "device token");
        const fcmNoti = yield (0, notifications_1.sendNotification)({
            title,
            message,
            token: getRecieverToken,
            data,
        });
        return notification;
    }
    catch (error) {
        // Return error if anything goes wrong
        return error.message;
    }
});
exports.createNotification = createNotification;
const getAllNotificationsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.params;
    var query = {};
    const currentPage = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) + 1 || 1;
    let limit = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
    const skip = limit * (currentPage - 1);
    if (userId)
        query.receiver = (0, RequestHelper_1.ObjectId)(userId.toString());
    try {
        const data = yield notifications_model_1.default.find(query)
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate("sender", "firstName lastName")
            .populate("receiver", "firstName lastName");
        const unReadCount = yield notifications_model_1.default.countDocuments(Object.assign(Object.assign({}, query), { isRead: false }));
        const totalCount = yield notifications_model_1.default.countDocuments(Object.assign({}, query));
        return res.status(200).json({
            status: 200,
            success: true,
            data: { data, unReadCount },
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "Notification fetched successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getAllNotificationsByUser = getAllNotificationsByUser;
const notificationReaded = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { notificationId } = req.params;
    try {
        const noti = yield notifications_model_1.default.findByIdAndUpdate((0, RequestHelper_1.ObjectId)(notificationId.toString()), { $set: { isRead: true } }, { new: true });
        return res.status(200).json({
            status: 200,
            success: true,
            message: "notiifcation has been read",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.notificationReaded = notificationReaded;
const saveDeviceTokenInDb = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { type, deviceToken } = req.body;
    try {
        const user = yield user_model_1.default.findById((0, RequestHelper_1.ObjectId)(userId.toString()));
        if (type.toString() === "web") {
            user.webDeviceToken = deviceToken;
        }
        yield user.save();
        return res.status(200).json({
            status: 200,
            success: true,
            data: user,
            message: "Device token saved",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.saveDeviceTokenInDb = saveDeviceTokenInDb;
