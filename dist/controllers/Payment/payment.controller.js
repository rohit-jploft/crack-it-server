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
exports.payThroughWallet = exports.checkAndVerifyPayment = exports.createPaymentIntent = void 0;
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const RequestHelper_1 = require("../../helper/RequestHelper");
const Notification_controller_1 = require("../Notifications/Notification.controller");
const notificationMessageConstant_1 = require("../../utils/notificationMessageConstant");
const NotificationType_1 = require("../../utils/NotificationType");
const wallet_model_1 = __importDefault(require("../../models/wallet.model"));
const wallet_controller_1 = require("../Wallet/wallet.controller");
const impFunctions_1 = require("../../helper/impFunctions");
const wallet_schema_1 = require("../../schemas/wallet.schema");
const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
const stripe = require("stripe")(stripeSecretKey);
const createPaymentIntent = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { amount, meetingId } = req.body;
    const lineItems = [
        {
            price_data: {
                currency: "USD",
                product_data: {
                    name: "Booking",
                    images: [],
                },
                unit_amount: parseFloat(amount) * 100,
            },
            quantity: 1,
        },
    ];
    const session = yield stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        line_items: lineItems,
        mode: "payment",
        success_url: "https://crack-it-website.netlify.app/check-payment",
        cancel_url: "http://crack-it-website.netlify.app/mybookings/Requested",
    });
    console.log(session, "session");
    // const check = stripe.paymentIntents.retrieve(session.id);
    // console.log(check, "checkPayment")
    if (session) {
        const meeting = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(meetingId));
        // await createConversation(meetArr, meetingId);
        const payment = yield bookingPayment_model_1.default.findOneAndUpdate({ booking: (0, RequestHelper_1.ObjectId)(meetingId) }, {
            // status: "PAID",
            paymentObj: session,
        }, { new: true });
        console.log(meeting, payment);
    }
    return res.status(200).json({ id: session.id, bookingId: meetingId });
});
exports.createPaymentIntent = createPaymentIntent;
const checkAndVerifyPayment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { type, id, bookingId } = req.body;
    try {
        const checkIntent = type === "session"
            ? yield stripe.checkout.sessions.retrieve(id)
            : yield stripe.paymentIntents.retrieve(id);
        console.log(checkIntent);
        if (checkIntent.status === "succeeded") {
            const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId.toString()));
            var payment = yield bookingPayment_model_1.default.findOne({
                booking: (0, RequestHelper_1.ObjectId)(bookingId.toString()),
            });
            booking.status = "CONFIRMED";
            payment.status = "PAID";
            payment.paymentObj = checkIntent;
            yield booking.save();
            yield payment.save();
            yield (0, Notification_controller_1.createNotification)(booking.user, booking.expert, notificationMessageConstant_1.NoticationMessage.ConfirmedBooking.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.ConfirmedBooking.message, { targetId: booking === null || booking === void 0 ? void 0 : booking._id }, {});
            return res.status(200).json({
                success: true,
                status: 200,
                data: payment,
            });
        }
        if (checkIntent.status === "complete") {
            const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId.toString()));
            var payment = yield bookingPayment_model_1.default.findOne({
                booking: (0, RequestHelper_1.ObjectId)(bookingId.toString()),
            });
            booking.status = "CONFIRMED";
            payment.status = "PAID";
            payment.paymentObj = checkIntent;
            yield booking.save();
            yield payment.save();
            return res.status(200).json({
                success: true,
                status: 200,
                data: payment,
            });
        }
        return res.status(207).json({
            success: false,
            status: 207,
            message: "Payment failed",
            // data: checkIntent,
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
exports.checkAndVerifyPayment = checkAndVerifyPayment;
const payThroughWallet = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId, amount, userId } = req.body;
    const data = req.body;
    // Validate the request data using Joi schema
    const { value, error } = wallet_schema_1.payWithWallet.validate(data);
    // Return if there's a validation error
    if (error) {
        return res.status(400).json({
            success: false,
            status: 400,
            message: error.message,
        });
    }
    try {
        const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId));
        if (booking.status === "CONFIRMED") {
            return res.status(200).json({
                success: false,
                status: 200,
                type: 'error',
                message: "Payment has been already done"
            });
        }
        const checkWallet = yield wallet_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)(userId.toString()),
        });
        if (parseFloat(amount) > checkWallet.amount) {
            return res.status(200).json({
                status: 200,
                success: false,
                type: "error",
                message: "Insufficient balance",
            });
        }
        else {
            const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
            const transaction = yield (0, wallet_controller_1.createTransaction)(amount, "DEBIT", userId, superAdminId, "Booking payment");
            if (transaction) {
                const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId.toString()));
                var payment = yield bookingPayment_model_1.default.findOne({
                    booking: (0, RequestHelper_1.ObjectId)(bookingId.toString()),
                });
                booking.status = "CONFIRMED";
                payment.status = "PAID";
                payment.paymentObj = {
                    method: "WALLET",
                    transaction: transaction
                };
                yield booking.save();
                yield payment.save();
                return res.status(200).json({
                    success: true,
                    status: 200,
                    data: payment,
                });
            }
            return res.status(200).json({
                success: true,
                status: 200,
                type: "success",
                data: transaction,
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
exports.payThroughWallet = payThroughWallet;
