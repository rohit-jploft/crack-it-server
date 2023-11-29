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
exports.getSingleBookingDetail = exports.getAllBookingPayments = exports.declinedBooking = exports.acceptBooking = exports.cancelBooking = exports.ifCancelByExpertThanFirstChargeThanRefund = exports.refundAmountForMeeting = exports.getAllBooking = exports.createBooking = void 0;
const RequestHelper_1 = require("../../helper/RequestHelper");
const booking_schema_1 = __importDefault(require("../../schemas/booking.schema"));
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const helper_1 = require("../../helper/helper");
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const experts_model_1 = __importDefault(require("../../models/experts.model"));
const commission_model_1 = __importDefault(require("../../models/commission.model"));
const pagination_1 = require("../../helper/pagination");
const role_1 = require("../../utils/role");
const Notification_controller_1 = require("../Notifications/Notification.controller");
const notificationMessageConstant_1 = require("../../utils/notificationMessageConstant");
const NotificationType_1 = require("../../utils/NotificationType");
const wallet_controller_1 = require("../Wallet/wallet.controller");
const impFunctions_1 = require("../../helper/impFunctions");
const refund_controller_1 = require("../Refund/refund.controller");
const wallet_model_1 = __importDefault(require("../../models/wallet.model"));
const bookingHelper_1 = require("../../helper/bookingHelper");
const createBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { error, value } = booking_schema_1.default.validate(data);
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    // console.log(value, "vz")
    let totalCommission = 0;
    try {
        // get price of an expert per hour
        const getPriceOfExpertPerHour = yield experts_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)(value.expert),
        }).select("price");
        // Save the booking details
        // console.log(getTimeInDateStamp("12:10:00"), "startTime");
        const finalDate = (0, helper_1.getTheTimeZoneConvertedTime)(value.date, value.timeZone, true);
        const checkIfalreadyBooked = yield booking_model_1.default.findOne({
            expert: (0, RequestHelper_1.ObjectId)(value.expert),
            date: (0, helper_1.getTheFinalStartTimeConvertedInDesiredTimeZone)(finalDate, value.startTime, value.timeZone),
            startTime: (0, helper_1.getTheFinalStartTimeConvertedInDesiredTimeZone)(finalDate, value.startTime, value.timeZone),
            status: { $in: ["ACCEPTED", "REQUESTED"] },
        });
        const finalEndTime = (0, helper_1.addMinutesToTime)(value.startTime, value.duration);
        if (!checkIfalreadyBooked) {
            const bookingObj = new booking_model_1.default({
                user: (0, RequestHelper_1.ObjectId)(value.user),
                expert: (0, RequestHelper_1.ObjectId)(value.expert),
                jobCategory: value.jobCategory,
                jobDescription: value.jobDescription ? value.jobDescription : "",
                startTime: (0, helper_1.getTheFinalStartTimeConvertedInDesiredTimeZone)(finalDate, value.startTime, value.timeZone),
                date: (0, helper_1.getTheFinalStartTimeConvertedInDesiredTimeZone)(finalDate, value.startTime, value.timeZone),
                skills: value.skills ? value.skills : [],
                duration: value.duration,
                timeZone: value.timeZone,
                endTime: (0, helper_1.getTheFinalStartTimeConvertedInDesiredTimeZone)(finalDate, finalEndTime, value.timeZone),
            });
            // console.log(value.startTime);
            const getCommission = yield commission_model_1.default.findOne({
                type: "FIXED",
                isDeleted: false,
            });
            totalCommission = getCommission === null || getCommission === void 0 ? void 0 : getCommission.amount;
            const savedBooking = yield bookingObj.save();
            yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(value.user), (0, RequestHelper_1.ObjectId)(value.expert), notificationMessageConstant_1.NoticationMessage.BookingRequest.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.BookingRequest.message, { targetId: savedBooking._id });
            const agency = yield (0, bookingHelper_1.getAgencyOfAnyExpert)((0, RequestHelper_1.ObjectId)(value.expert));
            if (agency && (agency === null || agency === void 0 ? void 0 : agency.isAssociatedWithAgency) && agency !== null) {
                yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(value.user), (0, RequestHelper_1.ObjectId)(agency.agencyId), notificationMessageConstant_1.NoticationMessage.BookingRequest.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.BookingRequest.message, { targetId: savedBooking._id });
            }
            let totalAmount = (value.duration / 60) * (getPriceOfExpertPerHour === null || getPriceOfExpertPerHour === void 0 ? void 0 : getPriceOfExpertPerHour.price);
            const bookPaymentObj = new bookingPayment_model_1.default({
                booking: savedBooking._id,
                totalAmount,
                CommissionAmount: totalCommission,
                grandTotal: totalAmount + totalCommission,
            });
            const savedPayment = yield bookPaymentObj.save();
            return res.status(200).json({
                status: 200,
                success: true,
                data: savedBooking,
                message: "Booking created successfully",
            });
        }
        else {
            return res.status(203).json({
                type: "error",
                status: 203,
                message: `expert is already Booked at ${value.startTime} on ${value.date}`,
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
exports.createBooking = createBooking;
const getTimeFromDate = (date) => {
    const hours = date.getHours();
    const minutes = date.getMinutes();
    return `${hours}:${minutes}`;
};
// export const getAllBooking = async (req: Request, res: Response) => {
//   const { userId, status, role, tabStatus } = req.query;
//   const currentPage = Number(req?.query?.page) + 1 || 1;
//   const currentDateTime = new Date();
//   let limit = Number(req?.query?.limit) || 10;
//   const skip = limit * (currentPage - 1);
//   var query = <any>{};
//   if (tabStatus) {
//     if (tabStatus.toString().toUpperCase() === "UPCOMING") {
//       query["$or"] = [
//         { date: { $gte: currentDateTime } }, // Meetings on future days
//         {
//           date: currentDateTime, // Meetings on the current day but future times
//           startTime: { $gte: currentDateTime },
//         },
//       ];
//     }
//     if (tabStatus.toString().toUpperCase() === "PAST") {
//       query["$or"] = [
//         { date: { $lt: currentDateTime } }, // Meetings on previous days
//         {
//           date: currentDateTime, // Meetings on the current day but past times
//           endTime: { $lt: currentDateTime },
//         },
//       ];
//     }
//     if (tabStatus.toString().toUpperCase() === "CANCELLED") {
//       query.status = "CANCELLED";
//     }
//   }
//   if (userId) {
//     query["$or"] = [
//       { user: ObjectId(userId.toString()) },
//       { expert: ObjectId(userId.toString()) },
//     ];
//   }
//   if (status) query.status = { $regex: status.toString(), $options: "i" };
//   try {
//     const bookings = await Booking.find(query)
//       .populate("jobCategory", "title")
//       .populate("expert", "-password")
//       .populate("user", "-password")
//       .populate({
//         path: "skills",
//         select: "title",
//         populate: {
//           path: "parent",
//           select: "title",
//         },
//       })
//       .skip(skip)
//       .limit(limit)
//       .sort({ createdAt: -1 });
//     const totalCount = await Booking.countDocuments(query);
//     return res.status(200).json({
//       success: true,
//       status: 200,
//       data: bookings,
//       pagination: pagination(totalCount, currentPage, limit),
//       message: "Booking details fetched successfully",
//     });
//   } catch (error: any) {
//     // Return error if anything goes wrong
//     return res.status(403).json({
//       success: false,
//       status: 403,
//       message: error.message,
//     });
//   }
// };
const getAllBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId, status, role, tabStatus } = req.query;
    const currentPage = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) + 1 || 1;
    const currentDateTime = new Date();
    let limit = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
    const skip = limit * (currentPage - 1);
    const matchQuery = {};
    // console.log(userId, status, role, tabStatus);
    if (!status) {
        matchQuery.status;
    }
    if (tabStatus) {
        if (tabStatus.toString().toUpperCase() === "REQUESTED" ||
            tabStatus.toString().toUpperCase() === "NEW") {
            matchQuery.status = { $in: ["REQUESTED", "ACCEPTED"] };
        }
        if (tabStatus.toString().toUpperCase() === "UPCOMING") {
            matchQuery["$or"] = [
                { status: "CONFIRMED" }, // Meetings on future days
                // {
                //   date: currentDateTime, // Meetings on the current day but future times
                //   startTime: { $gte: currentDateTime },
                //   status: "CONFIRMED",
                // },
            ];
        }
        if (tabStatus.toString().toUpperCase() === "PAST") {
            matchQuery["$or"] = [
                { status: { $in: ["DECLINED", "CANCELLED", "COMPLETED"] } }, // Meetings on previous days
                // {
                //   date: currentDateTime, // Meetings on the current day but past times
                //   endTime: { $lt: currentDateTime },
                //   status: "COMPLETED",
                // },
            ];
        }
    }
    if (userId) {
        // if (tabStatus?.toString().toUpperCase() === "CANCELLED") {
        // matchQuery["$or"] = [
        //   { user: ObjectId(userId.toString()) },
        //   { expert: ObjectId(userId.toString()) },
        // ];
        if (role === role_1.Roles.USER)
            matchQuery.user = (0, RequestHelper_1.ObjectId)(userId.toString());
        if (role === role_1.Roles.EXPERT)
            matchQuery.expert = (0, RequestHelper_1.ObjectId)(userId.toString());
        // if (role === "AGENCY") matchQuery.expert = ObjectId(userId.toString());
        //   matchQuery.status = "CANCELLED";
        // } else {
        //   if (role === "USER") matchQuery.user = ObjectId(userId.toString());
        //   if (role === "EXPERT") matchQuery.expert = ObjectId(userId.toString());
        // }
    }
    if (status) {
        matchQuery.status = { $regex: status.toString(), $options: "i" };
    }
    try {
        const aggregatePipeline = [
            {
                $match: matchQuery,
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "jobCategory",
                    foreignField: "_id",
                    as: "jobCategory",
                },
            },
            {
                $unwind: {
                    path: "$jobCategory",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "experts",
                    localField: "expert",
                    foreignField: "user",
                    as: "expertData",
                    // pipeline:[{
                    // }]
                },
            },
            {
                $unwind: {
                    path: "$expertData",
                    preserveNullAndEmptyArrays: false,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "expertData.expertise",
                    foreignField: "_id",
                    as: "expertise",
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "expert",
                    foreignField: "_id",
                    as: "expert",
                },
            },
            {
                $unwind: {
                    path: "$expert",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "bookingpayments",
                    localField: "_id",
                    foreignField: "booking",
                    as: "PaymentData",
                },
            },
            {
                $unwind: {
                    path: "$PaymentData",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "user",
                    foreignField: "_id",
                    as: "user",
                },
            },
            {
                $unwind: {
                    path: "$user",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "categories",
                    localField: "skills",
                    foreignField: "_id",
                    as: "skillData",
                },
            },
            // {
            //   $addFields: {
            //     skills: {
            //       $arrayElemAt: ["$skills", 0],
            //     },
            //   },
            // },
            // {
            //   $unwind: {
            //     path: "$skills",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
                $lookup: {
                    from: "categories",
                    localField: "skills.parent",
                    foreignField: "_id",
                    as: "skills.parent",
                },
            },
            {
                $unwind: {
                    path: "$skills.parent",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $skip: skip,
            },
            {
                $limit: limit,
            },
            {
                $sort: { createdAt: -1 },
            },
        ];
        const bookings = yield booking_model_1.default.aggregate([...aggregatePipeline]);
        const totalCount = yield booking_model_1.default.countDocuments(matchQuery);
        return res.status(200).json({
            success: true,
            status: 200,
            data: bookings,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "Booking details fetched successfully",
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
exports.getAllBooking = getAllBooking;
const refundAmountForMeeting = (meetingId) => __awaiter(void 0, void 0, void 0, function* () {
    const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
    try {
        const booking = yield bookingPayment_model_1.default.findOne({ booking: meetingId });
        if ((booking === null || booking === void 0 ? void 0 : booking.status) === "PAID") {
            yield (0, wallet_controller_1.createTransaction)(booking.totalAmount, "CREDIT", booking === null || booking === void 0 ? void 0 : booking.user, superAdminId, "refund");
        }
    }
    catch (error) {
        return error.message;
    }
});
exports.refundAmountForMeeting = refundAmountForMeeting;
const ifCancelByExpertThanFirstChargeThanRefund = (res, bookingId) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
        const booking = yield booking_model_1.default.findById(bookingId);
        const bookingPayment = yield bookingPayment_model_1.default.findOne({ booking: (0, RequestHelper_1.ObjectId)(bookingId.toString()) });
        const ExpertWallet = yield wallet_model_1.default.findOne({ user: booking.expert });
        if (ExpertWallet.amount < 25) {
            return {
                isLow: false,
            };
        }
        else {
            var trans = yield (0, wallet_controller_1.createTransaction)(25, "DEBIT", booking.expert, superAdminId, "Cancellation charge");
            var userTrans = yield (0, wallet_controller_1.createTransaction)(bookingPayment.totalAmount, "CREDIT", booking.user, superAdminId, "Cancellation return");
            return { trans, userTrans, isLow: true };
        }
    }
    catch (error) {
        return error.message;
    }
});
exports.ifCancelByExpertThanFirstChargeThanRefund = ifCancelByExpertThanFirstChargeThanRefund;
const cancelBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { bookingId } = req.params;
    const { role } = req.query;
    const superAdminId = yield (0, impFunctions_1.getSuperAdminId)();
    try {
        const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId));
        if (role === "USER" && booking.status === "CONFIRMED") {
            const ref = yield (0, refund_controller_1.getRefundAmountFromBooking)(booking._id);
            console.log(ref, "ref");
        }
        if (role === "EXPERT" && booking.status === "CONFIRMED") {
            // + 50 is for store creedit
            const trans = yield (0, wallet_controller_1.createTransaction)(booking.totalAmount + 50, "CREDIT", booking.user, superAdminId, "Refund for cancellation by expert");
            console.log(trans, "trans");
        }
        if (role === "EXPERT" && booking.status === "CONFIRMED") {
            const check = yield (0, exports.ifCancelByExpertThanFirstChargeThanRefund)(res, (0, RequestHelper_1.ObjectId)(bookingId));
            if (check && !(check === null || check === void 0 ? void 0 : check.isLow)) {
                return res.status(201).json({
                    status: 201,
                    success: false,
                    message: "you need to have $25 to cancel the meeting",
                });
            }
        }
        // await createNewRefundRequest(ObjectId(bookingId),50 );
        booking.status = "CANCELLED";
        yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(booking.user), (0, RequestHelper_1.ObjectId)(booking.expert), notificationMessageConstant_1.NoticationMessage.CancelBooking.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.CancelBooking.message, { targetId: booking._id });
        yield booking.save();
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Booking cancelled successfully",
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
exports.cancelBooking = cancelBooking;
const acceptBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bookingId } = req.params;
    try {
        // if payment done then
        const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId));
        if ((booking === null || booking === void 0 ? void 0 : booking.status) === "ACCEPTED") {
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Booking request is already accepted",
            });
        }
        booking.status = "ACCEPTED";
        yield (booking === null || booking === void 0 ? void 0 : booking.save());
        yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(booking.expert), (0, RequestHelper_1.ObjectId)(booking.user), notificationMessageConstant_1.NoticationMessage.BookingAccept.title, NotificationType_1.NotificationType.Booking, "web", notificationMessageConstant_1.NoticationMessage.BookingAccept.message, { targetId: booking._id });
        if (booking) {
            // const chat = await Chat.findOne({ booking: ObjectId(bookingId) });
            // console.log(chat);
            // if (!chat) {
            //   await createConversation(
            //     [booking?.expert, booking?.user],
            //     ObjectId(bookingId)
            //   );
            // }
            return res.status(200).json({
                status: 200,
                success: true,
                data: booking,
                message: "Booking request accepted successfully",
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
exports.acceptBooking = acceptBooking;
const declinedBooking = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { bookingId } = req.params;
    try {
        // if payment done then
        const booking = yield booking_model_1.default.findById((0, RequestHelper_1.ObjectId)(bookingId));
        if ((booking === null || booking === void 0 ? void 0 : booking.status) === "DECLINED") {
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Booking request is already declined",
            });
        }
        booking.status = "DECLINED";
        yield (booking === null || booking === void 0 ? void 0 : booking.save());
        if (booking) {
            // const chat = await Chat.findOne({ booking: ObjectId(bookingId) });
            // console.log(chat);
            // if (!chat) {
            //   await createConversation(
            //     [booking?.expert, booking?.user],
            //     ObjectId(bookingId)
            //   );
            // }
            return res.status(200).json({
                status: 200,
                success: true,
                data: booking,
                message: "Booking request declined successfully",
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
exports.declinedBooking = declinedBooking;
const getAllBookingPayments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { status } = req.query;
    var query = {};
    if (status)
        query.status = status;
    const currentPage = Number((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.page) + 1 || 1;
    let limit = Number((_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.limit) || 10;
    const skip = limit * (currentPage - 1);
    try {
        const payments = yield bookingPayment_model_1.default.find(query)
            .populate({
            path: "booking",
            populate: {
                path: "user expert",
                select: "firstName lastName",
            },
        })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCount = yield bookingPayment_model_1.default.countDocuments(query);
        return res.status(200).json({
            success: true,
            status: 200,
            data: payments,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "Payment detail fetched successfully",
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
exports.getAllBookingPayments = getAllBookingPayments;
const getSingleBookingDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const { bookingId } = req.params;
    var finalRes;
    try {
        // const booking = await Booking.findById(bookingId)
        //   .populate("expert", "firstName lastName email")
        //   .populate("expert", "firstName lastName email");
        // finalRes.booking = booking;
        const payment = yield bookingPayment_model_1.default.findOne({
            booking: bookingId,
        })
            .populate("promoCode")
            .populate({
            path: "booking",
            populate: {
                path: "expert user jobCategory skills",
                select: "-password",
            },
        });
        const expert = yield experts_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)((_f = (_e = payment === null || payment === void 0 ? void 0 : payment.booking) === null || _e === void 0 ? void 0 : _e.expert) === null || _f === void 0 ? void 0 : _f._id.toString()),
        }).populate("jobCategory");
        const newSkills = [];
        // for (let ele in payment?.booking?.skills) {
        //    if(ele && ele?.parent){
        //     const parent = await Category.findOne({_id:ObjectId(ele?.parent.toString())})
        //    }
        // }
        finalRes = {
            booking: payment,
            expertProfile: expert,
        };
        return res.status(200).json({
            success: true,
            status: 200,
            data: finalRes,
            message: "Booking detail fetched successfully",
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
exports.getSingleBookingDetail = getSingleBookingDetail;
