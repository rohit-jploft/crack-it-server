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
exports.markChatClosedAfterTheMeeting = exports.startChatForConfirmedBookingBefore15Min = exports.makeStatusFromConfirmedToCompleted = void 0;
const chat_controller_1 = require("../controllers/Chat/chat.controller");
const Notification_controller_1 = require("../controllers/Notifications/Notification.controller");
const wallet_controller_1 = require("../controllers/Wallet/wallet.controller");
const RequestHelper_1 = require("../helper/RequestHelper");
const impFunctions_1 = require("../helper/impFunctions");
const booking_model_1 = __importDefault(require("../models/booking.model"));
const bookingPayment_model_1 = __importDefault(require("../models/bookingPayment.model"));
const chat_model_1 = __importDefault(require("../models/chat.model"));
const experts_model_1 = __importDefault(require("../models/experts.model"));
const NotificationType_1 = require("../utils/NotificationType");
const notificationMessageConstant_1 = require("../utils/notificationMessageConstant");
const makeStatusFromConfirmedToCompleted = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const todaysDate = new Date();
        const getBooking = yield booking_model_1.default.updateMany({ status: "CONFIRMED", endTime: { $lt: todaysDate } }, { status: "COMPLETED" });
        const ReqBooking = yield booking_model_1.default.updateMany({
            status: { $in: ["REQUESTED", "ACCEPTED"] },
            endTime: { $lt: todaysDate },
        }, { status: "CANCELLED" });
        const booking = yield booking_model_1.default.find({
            status: "CONFIRMED",
            endTime: { $lt: todaysDate },
        });
        const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
        for (let book of booking) {
            const bookingPayment = yield bookingPayment_model_1.default.findOne({
                booking: (0, RequestHelper_1.ObjectId)(book._id),
            });
            yield chat_model_1.default.findOneAndUpdate({ booking: (0, RequestHelper_1.ObjectId)(book._id) }, { isClosed: true });
            yield (0, wallet_controller_1.createTransaction)(bookingPayment === null || bookingPayment === void 0 ? void 0 : bookingPayment.totalAmount, "CREDIT", book.expert, superAdminId, "Booking Payment");
        }
        return getBooking;
    }
    catch (error) {
        return error;
    }
});
exports.makeStatusFromConfirmedToCompleted = makeStatusFromConfirmedToCompleted;
const startChatForConfirmedBookingBefore15Min = () => __awaiter(void 0, void 0, void 0, function* () {
    const currentTime = new Date();
    try {
        // Find upcoming bookings where the chat should be started
        const upcomingBookings = yield booking_model_1.default.find({
            startTime: {
                $lte: new Date(currentTime.getTime() + 15 * 60000),
                $gt: currentTime,
            },
            // date:
            status: "CONFIRMED", // Adjust this to match your criteria for initiating chat conversations
        });
        // Iterate over the upcoming bookings and start chat conversations
        for (const booking of upcomingBookings) {
            const checkChatCreatedOrNot = yield chat_model_1.default.findOne({
                booking: (0, RequestHelper_1.ObjectId)(booking._id),
            });
            if (!checkChatCreatedOrNot) {
                const expert = yield experts_model_1.default.findOne({
                    user: (0, RequestHelper_1.ObjectId)(booking.expert.toString()),
                });
                const agency = expert && expert.agency ? expert.agency : null;
                const convo = yield (0, chat_controller_1.createConversation)([
                    (0, RequestHelper_1.ObjectId)(booking.expert.toString()),
                    (0, RequestHelper_1.ObjectId)(booking.user.toString()),
                ], booking._id, agency);
                if (convo && convo.isNew) {
                    yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(booking.expert.toString()), (0, RequestHelper_1.ObjectId)(booking.user.toString()), notificationMessageConstant_1.NoticationMessage.ChatInitiated.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.ChatInitiated.message, { targetId: booking._id });
                    yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(booking.user.toString()), (0, RequestHelper_1.ObjectId)(booking.expert.toString()), notificationMessageConstant_1.NoticationMessage.ChatInitiated.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.ChatInitiated.message, { targetId: booking._id });
                }
            }
        }
    }
    catch (error) {
        return error;
    }
});
exports.startChatForConfirmedBookingBefore15Min = startChatForConfirmedBookingBefore15Min;
const markChatClosedAfterTheMeeting = () => __awaiter(void 0, void 0, void 0, function* () {
    const todayDate = new Date();
    const getBooking = yield booking_model_1.default.find({ startTime: { $lt: todayDate } });
    for (let book of getBooking) {
        const chatsDoc = yield chat_model_1.default.findOneAndUpdate({ booking: (0, RequestHelper_1.ObjectId)(book._id) }, { isClosed: true });
    }
});
exports.markChatClosedAfterTheMeeting = markChatClosedAfterTheMeeting;
