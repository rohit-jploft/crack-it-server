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
exports.getPaymentPageStats = exports.getAllUsers = exports.getDashboardData = void 0;
const user_model_1 = __importDefault(require("../../models/user.model"));
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const pagination_1 = require("../../helper/pagination");
const role_1 = require("../../utils/role");
const getDashboardData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const totalUser = yield user_model_1.default.countDocuments({ role: "USER" });
        const totalExpert = yield user_model_1.default.countDocuments({ role: "EXPERT" });
        const totalAgency = yield user_model_1.default.countDocuments({ role: "AGENCY" });
        const totalMeetingCompleted = (yield booking_model_1.default.countDocuments({ status: "CONFIRMED" })) || 0;
        // const totalEarning = await BookingPayment.countDocuments({status:"PAID"}) || 0;
        // Define the aggregation pipeline
        const pipeline = [
            {
                $match: {
                    status: "PAID", // Match documents with the "PAID" status
                },
            },
            {
                $group: {
                    _id: null,
                    totalCommission: {
                        $sum: "$CommissionAmount", // Calculate the sum of CommissionAmount
                    },
                },
            },
        ];
        // Execute the aggregation pipeline
        const result = yield bookingPayment_model_1.default.aggregate(pipeline);
        console.log(result);
        // Extract the total commission from the result
        const totalEarning = ((_a = result[0]) === null || _a === void 0 ? void 0 : _a.totalCommission) || 0;
        console.log({
            totalUser,
            totalExpert,
            totalEarning,
            totalMeetingCompleted,
        });
        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                totalUser,
                totalExpert,
                totalEarning,
                totalMeetingCompleted,
                totalAgency,
            },
            message: "Dashboard data fetched",
        });
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getDashboardData = getDashboardData;
const getAllUsers = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b, _c;
    const { role, search, isAdmin } = req.query;
    const currentPage = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.page) + 1 || 1;
    let limit = Number((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.limit) || 10;
    const skip = limit * (currentPage - 1);
    var query = {};
    if (role && role !== "AGENCY-EXPERT") {
        query.role = role.toString();
        query.agency = { $exists: false };
    }
    ;
    if (role === "AGENCY-EXPERT") {
        // query.role = "EXPERT"
        query.agency = { $exists: true };
    }
    if (search) {
        query.$or = [
            { firstName: { $regex: search, $options: "i" } },
            { lastName: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            //   { phone: { $regex: parseInt(search), $options: "i" } },
        ];
    }
    if (isAdmin && isAdmin === "0" && !role) {
        query.role = { $in: [role_1.Roles.USER, role_1.Roles.EXPERT] };
    }
    if (isAdmin && isAdmin === "0" && role) {
        if (role === "AGENCY-EXPERT") {
            query.role = "EXPERT";
        }
        else {
            query.role = { $in: [role.toString()] };
        }
    }
    try {
        console.log("query ", query);
        const users = yield user_model_1.default.find(query, { password: 0 })
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCount = yield user_model_1.default.countDocuments(query);
        console.log(totalCount);
        return res.status(200).json({
            success: true,
            status: 200,
            data: users,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "All users fetched successfully",
        });
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getAllUsers = getAllUsers;
const getPaymentPageStats = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _d, _e, _f;
    let { from, to } = req.query;
    try {
        // Calculate the total revenue
        const totalRevenueResult = yield bookingPayment_model_1.default.aggregate([
            {
                $group: {
                    _id: null,
                    totalRevenue: { $sum: "$grandTotal" },
                },
            },
        ]);
        // Calculate the realized commission (status = PAID)
        const realizedCommissionResult = yield bookingPayment_model_1.default.aggregate([
            {
                $match: {
                    status: "PAID",
                },
            },
            {
                $group: {
                    _id: null,
                    realizedCommission: { $sum: "$CommissionAmount" },
                },
            },
        ]);
        // Calculate the unrealized commission (status = UNPAID)
        const unrealizedCommissionResult = yield bookingPayment_model_1.default.aggregate([
            {
                $match: {
                    status: "UNPAID",
                },
            },
            {
                $group: {
                    _id: null,
                    unrealizedCommission: { $sum: "$CommissionAmount" },
                },
            },
        ]);
        // Prepare the response
        let response = {
            totalRevenue: ((_d = totalRevenueResult[0]) === null || _d === void 0 ? void 0 : _d.totalRevenue) || 0,
            realizedCommission: ((_e = realizedCommissionResult[0]) === null || _e === void 0 ? void 0 : _e.realizedCommission) || 0,
            unrealizedCommission: ((_f = unrealizedCommissionResult[0]) === null || _f === void 0 ? void 0 : _f.unrealizedCommission) || 0,
        };
        response.totalEarning =
            response.realizedCommission + response.unrealizedCommission;
        return res.status(200).json({
            success: true,
            status: 200,
            data: response,
            message: "data fetched successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }
});
exports.getPaymentPageStats = getPaymentPageStats;
