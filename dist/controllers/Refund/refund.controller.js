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
exports.getRefundAmountFromBooking = exports.getTheRefundPercentage = exports.createNewRefundRequest = void 0;
const refund_model_1 = __importDefault(require("../../models/refund.model"));
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const helper_1 = require("../../helper/helper");
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const wallet_controller_1 = require("../Wallet/wallet.controller");
const user_model_1 = __importDefault(require("../../models/user.model"));
const createNewRefundRequest = (bookingId, amount) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const refund = refund_model_1.default.create({
            booking: bookingId,
            amount: amount,
        });
        return refund;
    }
    catch (error) {
        return error.message;
    }
});
exports.createNewRefundRequest = createNewRefundRequest;
const getTheRefundPercentage = (hoursBefore) => __awaiter(void 0, void 0, void 0, function* () {
    let penaltyPercentage = 0;
    let expertPercentShare;
    let crackItPercentShare;
    if (hoursBefore >= 4) {
        penaltyPercentage = 50;
        expertPercentShare = 25;
        crackItPercentShare = 25;
    }
    else {
        penaltyPercentage = 75;
        expertPercentShare = 50;
        crackItPercentShare = 25;
    }
    return {
        penaltyPercentage,
        expertPercentShare,
        crackItPercentShare,
    };
});
exports.getTheRefundPercentage = getTheRefundPercentage;
// function to get the amount to be refunded to crack it or expert user
// while doing cancellation
const getRefundAmountFromBooking = (bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const booking = yield booking_model_1.default.findById(bookingId);
        const payment = yield bookingPayment_model_1.default.findOne({ booking: bookingId });
        // const combineDate = combineTimestamps(booking.date, booking.startTime);
        const getHourBefore = yield (0, helper_1.getHoursBefore)(booking.startTime);
        const getPercentage = yield (0, exports.getTheRefundPercentage)(getHourBefore);
        const expertrefundAmount = (getPercentage.expertPercentShare * payment.totalAmount) / 100;
        const userRefundAmount = ((100 - getPercentage.penaltyPercentage) * payment.totalAmount) / 100;
        const superAdmin = yield user_model_1.default.findOne({ role: "SUPER_ADMIN" });
        console.log(superAdmin, "superadmin");
        console.log(booking, "booking");
        const Experttrans = yield (0, wallet_controller_1.createTransaction)(expertrefundAmount, "CREDIT", booking.expert, superAdmin === null || superAdmin === void 0 ? void 0 : superAdmin._id, "REFUND");
        const userTrans = yield (0, wallet_controller_1.createTransaction)(userRefundAmount, "CREDIT", booking.user, superAdmin === null || superAdmin === void 0 ? void 0 : superAdmin._id, "REFUND");
        return { Experttrans, userTrans };
    }
    catch (error) {
        return error.message;
    }
});
exports.getRefundAmountFromBooking = getRefundAmountFromBooking;
