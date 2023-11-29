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
exports.payWithWallet = exports.updateWithDrawalReq = exports.getAllWithdrawalReq = exports.createWithdrawRequest = exports.getUserWallet = exports.getUsersTransaction = exports.createTransaction = exports.createWallet = void 0;
const RequestHelper_1 = require("../../helper/RequestHelper");
const wallet_model_1 = __importDefault(require("../../models/wallet.model"));
const wallet_schema_1 = __importDefault(require("../../schemas/wallet.schema"));
const withdrawal_model_1 = __importDefault(require("../../models/withdrawal.model"));
const mongoose_1 = require("mongoose");
const walletTransactions_model_1 = __importDefault(require("../../models/walletTransactions.model"));
const pagination_1 = require("../../helper/pagination");
const user_model_1 = __importDefault(require("../../models/user.model"));
const Notification_controller_1 = require("../Notifications/Notification.controller");
const NotificationType_1 = require("../../utils/NotificationType");
const notificationMessageConstant_1 = require("../../utils/notificationMessageConstant");
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const impFunctions_1 = require("../../helper/impFunctions");
const createWallet = (userId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const wallet = yield wallet_model_1.default.findOne({ user: (0, RequestHelper_1.ObjectId)(userId) });
        if (wallet) {
            return wallet;
        }
        else {
            const newWallet = yield wallet_model_1.default.create({
                user: (0, RequestHelper_1.ObjectId)(userId),
            });
            return newWallet;
        }
    }
    catch (error) {
        return error;
    }
});
exports.createWallet = createWallet;
const createTransaction = (amount, type, user, otherUser, title, txnType) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Ensure that user and otherUser exist and are valid ObjectId strings
        if (!mongoose_1.Types.ObjectId.isValid(user) || !mongoose_1.Types.ObjectId.isValid(otherUser)) {
            return { type: "error", message: "Invalid IDs" };
        }
        var otherUserWallet;
        // Check the user's wallet balance
        const userWallet = yield wallet_model_1.default.findOne({ user });
        if (!userWallet) {
            return { type: "error", message: "User wallet not found" };
        }
        // Check the otherUser's wallet balance (only for CREDIT transactions)
        if (type === "CREDIT") {
            otherUserWallet = yield wallet_model_1.default.findOne({ user: otherUser });
            const otherUserRole = yield user_model_1.default.findOne({ _id: otherUser });
            if (!otherUserWallet) {
                return { type: "error", message: "Other user wallet not found" };
            }
            if ((otherUserRole === null || otherUserRole === void 0 ? void 0 : otherUserRole.role) !== "SUPER_ADMIN" || txnType && txnType === "WITHDRAWAL") {
                if (otherUserWallet.amount < amount) {
                    return {
                        type: "error",
                        message: "Other user has insufficient funds",
                    };
                }
                otherUserWallet.amount -= amount;
            }
        }
        // Create a new wallet transaction for the user
        const userTransaction = new walletTransactions_model_1.default({
            amount,
            type,
            user,
            otherUser,
            title,
        });
        // Create a new wallet transaction for the otherUser (reverse type)
        const otherUserTransaction = new walletTransactions_model_1.default({
            amount: amount,
            type: type === "CREDIT" ? "DEBIT" : "CREDIT",
            user: otherUser,
            otherUser: user,
            title,
        });
        console.log(amount, "amount");
        // Save both transactions
        yield userTransaction.save();
        yield otherUserTransaction.save();
        // Update the user's wallet balance based on the transaction type
        if (type === "CREDIT") {
            userWallet.amount += amount;
        }
        else if (type === "DEBIT" && txnType !== "WITHDRAWAL") {
            userWallet.amount -= amount;
        }
        // Save the updated user wallet balance
        yield userWallet.save();
        return { userTransaction, otherUserTransaction };
    }
    catch (error) {
        return { message: "Server error", type: "error" };
    }
});
exports.createTransaction = createTransaction;
const getUsersTransaction = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    const currentPage = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) + 1 || 1;
    try {
        const userId = req.params.userId;
        // Ensure userId is a valid ObjectId string
        if (!mongoose_1.Types.ObjectId.isValid(userId)) {
            return res
                .status(400)
                .json({ type: "error", success: false, message: "Invalid user ID" });
        }
        // Find and return wallet transactions for the user
        const transactions = yield walletTransactions_model_1.default.find({ user: userId })
            .populate("user", "firstName lastName")
            .populate("otherUser", "firstName lastName")
            .sort({ createdAt: -1 });
        const wallet = yield (0, exports.createWallet)(userId);
        res.status(200).json({
            success: true,
            type: "success",
            data: { wallet: wallet, transactions },
            message: "All transaction fetched successfully",
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
exports.getUsersTransaction = getUsersTransaction;
const getUserWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const wallet = yield wallet_model_1.default.findOne({ user: (0, RequestHelper_1.ObjectId)(userId) }, { user: 1, amount: 1 }).populate("user", "firstName lastName email");
        return res.status(200).json({
            success: true,
            status: 200,
            data: wallet,
            message: "Wallet fetched successfully",
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
exports.getUserWallet = getUserWallet;
// withdrawal request apis
const createWithdrawRequest = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let data = req.body;
    // check validation error using JOI
    const { error, value } = wallet_schema_1.default.validate(data);
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        const userWallet = yield wallet_model_1.default.findOne({ user: (0, RequestHelper_1.ObjectId)(data.user) });
        if (userWallet.amount < data.amount) {
            return res.status(200).json({
                status: 202,
                success: false,
                message: "You cannot withdraw amount more than in your wallet",
            });
        }
        else {
            const withdrawal = yield withdrawal_model_1.default.create(value);
            userWallet.amount = userWallet.amount - value.amount;
            yield userWallet.save();
            return res.status(200).json({
                success: true,
                status: 200,
                data: withdrawal,
                message: "withdrawal request created successfully",
            });
        }
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
exports.createWithdrawRequest = createWithdrawRequest;
const getAllWithdrawalReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { userId, status } = req.query;
    let query = {};
    const currentPage = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.page) + 1 || 1;
    const currentDateTime = new Date();
    let limit = Number((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.limit) || 10;
    const skip = limit * (currentPage - 1);
    if (userId) {
        query.user = (0, RequestHelper_1.ObjectId)(userId.toString());
    }
    else {
        // const uId = res.locals.user._id;
        // query.user = ObjectId(uId.toString());
    }
    if (status) {
        query.status = { $regex: status, $options: "i" };
    }
    try {
        const requests = yield withdrawal_model_1.default.find(query)
            .populate("user", "firstName lastName phone countryCode email role")
            .populate("bank")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const totalCount = yield withdrawal_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            status: 200,
            data: requests,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "Withdrawal request fetched successfully",
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
exports.getAllWithdrawalReq = getAllWithdrawalReq;
const updateWithDrawalReq = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    const { status } = req.body;
    try {
        const withdrawal = yield withdrawal_model_1.default.findById(id);
        if ((withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.status) === status) {
            return res.status(200).json({
                success: true,
                status: 200,
                message: `Withdrawal request is already ${status}`,
            });
        }
        else {
            withdrawal.status = status;
            const admin = yield user_model_1.default.findOne({ role: "SUPER_ADMIN" });
            yield (0, Notification_controller_1.createNotification)(admin === null || admin === void 0 ? void 0 : admin._id, withdrawal.user, notificationMessageConstant_1.NoticationMessage.withDrawalApproved.title, NotificationType_1.NotificationType.Withdrawal, "web", notificationMessageConstant_1.NoticationMessage.withDrawalApproved.message, { targetId: withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal._id }, {});
            // const wallet: any = await Wallet.findOne({ user: withdrawal.user });
            // wallet.amount = wallet.amount + withdrawal.amount;
            // await wallet.save();   
            yield (0, exports.createTransaction)(withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.amount, "DEBIT", withdrawal === null || withdrawal === void 0 ? void 0 : withdrawal.user, admin === null || admin === void 0 ? void 0 : admin._id, "Withdraw", "WITHDRAWAL");
            yield withdrawal.save();
        }
        return res.status(200).json({
            success: true,
            status: 200,
            message: `withdrawal request has been successfully ${status}`,
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
exports.updateWithDrawalReq = updateWithDrawalReq;
const payWithWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, userId } = req.body;
    const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
    try {
        const booking = yield bookingPayment_model_1.default.findOne({
            booking: (0, RequestHelper_1.ObjectId)(bookingId.toString()),
        });
        if (booking.status === "PAID") {
            return res.status(201).json({
                status: 201,
                success: false,
                message: "Payment has been already done",
            });
        }
        let grandTotal = booking.grandTotal;
        console.log(grandTotal, "grandTotal");
        const userWallet = yield wallet_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)(userId.toString()),
        });
        console.log(userWallet, "userWallet");
        if ((userWallet === null || userWallet === void 0 ? void 0 : userWallet.amount) >= grandTotal) {
            // console.log(grandTotal, "grandTotal")
            const transaction = yield (0, exports.createTransaction)(grandTotal, "DEBIT", userId, superAdminId, "Booking Payment");
            console.log(transaction);
            booking.status = "PAID";
            const mainBooking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId));
            mainBooking.status = "CONFIRMED";
            booking.paymentObj = transaction;
            yield booking.save();
            yield mainBooking.save();
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    isPaymentCompleted: true,
                    transaction,
                },
                message: "payment successfull",
            });
        }
        else {
            let trans;
            if (userWallet.amount !== 0) {
                trans = yield (0, exports.createTransaction)(userWallet.amount, "DEBIT", userId, superAdminId, "Booking Payment");
            }
            console.log(trans, "trans");
            return res.status(200).json({
                status: 200,
                success: true,
                data: {
                    isPaymentCompleted: false,
                    transaction: trans ? trans : null,
                    remainingAmount: grandTotal - userWallet.amount,
                },
                message: "partial payment successfull",
            });
        }
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
exports.payWithWallet = payWithWallet;
