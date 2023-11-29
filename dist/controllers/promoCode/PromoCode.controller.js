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
exports.deletePromoCode = exports.removePromoCode = exports.validatePromoCode = exports.deletePromoCodeById = exports.makeActive = exports.updatePromoCodeById = exports.getPromoCodeById = exports.getAllPromoCodes = exports.createPromoCode = void 0;
const promoCode_model_1 = __importDefault(require("../../models/promoCode.model"));
const wallet_schema_1 = require("../../schemas/wallet.schema");
const RequestHelper_1 = require("../../helper/RequestHelper");
const pagination_1 = require("../../helper/pagination");
const bookingPayment_model_1 = __importDefault(require("../../models/bookingPayment.model"));
const createPromoCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // Validate the request data using Joi schema
        const { value, error } = wallet_schema_1.promoCodeSchema.validate(data);
        // Return if there's a validation error
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.message,
            });
        }
        const check = yield promoCode_model_1.default.findOne({ code: value.code });
        if (check) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Promo code should be unique",
            });
        }
        // Create a new Promo Code document and save it to the database
        else {
            const promoCode = yield promoCode_model_1.default.create(value);
            return res.status(201).json({
                status: 200,
                success: true,
                data: promoCode,
                message: "Promo Code created successfully",
            });
        }
    }
    catch (error) {
        // Handle any errors that occur during the creation process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.createPromoCode = createPromoCode;
// Get all Promo Codes
const getAllPromoCodes = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    let { search, isActive } = req.query;
    let query = { isDeleted: false };
    const currentPage = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) + 1 || 1;
    let limit = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
    const skip = limit * (currentPage - 1);
    if (search)
        query.code = { $regex: search, $options: "i" };
    if (isActive)
        query.isActive = isActive == "Active" ? true : false;
    try {
        // Retrieve all Promo Codes from the database
        const promoCodes = yield promoCode_model_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCount = yield promoCode_model_1.default.countDocuments(query);
        return res.status(200).json({
            status: 200,
            success: true,
            data: promoCodes,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
        });
    }
    catch (error) {
        // Handle any errors that occur during the retrieval process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.getAllPromoCodes = getAllPromoCodes;
// Get a single Promo Code by ID
const getPromoCodeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promoCodeId } = req.params;
        // Retrieve a Promo Code by ID from the database
        const promoCode = yield promoCode_model_1.default.findById(promoCodeId);
        if (!promoCode) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Promo Code not found",
            });
        }
        return res.status(200).json({
            status: 200,
            success: true,
            data: promoCode,
        });
    }
    catch (error) {
        // Handle any errors that occur during the retrieval process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.getPromoCodeById = getPromoCodeById;
// Update a Promo Code by ID
const updatePromoCodeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promoCodeId = req.params.promoCodeId;
        const updateData = req.body;
        // Validate the request data using Joi schema
        const { value, error } = wallet_schema_1.promoCodeSchema.validate(updateData);
        // Return if there's a validation error
        if (error) {
            return res.status(400).json({
                success: false,
                status: 400,
                message: error.message,
            });
        }
        // Update the Promo Code by ID and return the updated Promo Code
        const updatedPromoCode = yield promoCode_model_1.default.findOne({
            _id: (0, RequestHelper_1.ObjectId)(promoCodeId),
        });
        console.log(updatedPromoCode);
        if (!updatedPromoCode) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Promo Code not found",
            });
        }
        updatedPromoCode.code = value.code;
        updatedPromoCode.discountPercentage = value.discountPercentage;
        updatedPromoCode.type = value.type;
        updatedPromoCode.flatAmount = value.flatAmount;
        updatedPromoCode.expirationDate = value.expirationDate;
        yield updatedPromoCode.save();
        return res.status(200).json({
            status: 200,
            success: true,
            data: updatedPromoCode,
            message: "Promo Code updated successfully",
        });
    }
    catch (error) {
        // Handle any errors that occur during the update process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.updatePromoCodeById = updatePromoCodeById;
const makeActive = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { promoCodeId } = req.params;
    const { isActive } = req.body;
    try {
        const code = yield promoCode_model_1.default.findByIdAndUpdate((0, RequestHelper_1.ObjectId)(promoCodeId), {
            isActive: isActive,
        }, { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            data: code,
            message: "Promo code is " + isActive ? " Active" : " Inactive",
        });
    }
    catch (error) {
        // Handle any errors that occur during the update process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.makeActive = makeActive;
// Delete a Promo Code by ID
const deletePromoCodeById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const promoCodeId = req.params.id;
        // Delete the Promo Code by ID and return a success message
        const deletedPromoCode = yield promoCode_model_1.default.findByIdAndRemove(promoCodeId);
        if (!deletedPromoCode) {
            return res.status(404).json({
                success: false,
                status: 404,
                message: "Promo Code not found",
            });
        }
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Promo Code deleted successfully",
        });
    }
    catch (error) {
        // Handle any errors that occur during the deletion process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.deletePromoCodeById = deletePromoCodeById;
// Sample function to validate a Promo Code (customize as needed)
const validatePromoCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { promoCode, bookingId } = req.body;
        const getPromoCode = yield promoCode_model_1.default.findOne({
            isActive: true,
            code: promoCode,
            expirationDate: { $lte: new Date() },
        });
        console.log(getPromoCode, "code object from db");
        if (getPromoCode) {
            const bookingPayment = yield bookingPayment_model_1.default.findOne({
                booking: (0, RequestHelper_1.ObjectId)(bookingId),
            });
            console.log(bookingPayment);
            if (bookingPayment && bookingPayment.promoCode === null) {
                let discount;
                discount =
                    getPromoCode.type === "FLAT"
                        ? getPromoCode.flatAmount
                        : (getPromoCode.discountPercentage * (bookingPayment === null || bookingPayment === void 0 ? void 0 : bookingPayment.grandTotal)) /
                            100;
                bookingPayment.grandTotal = bookingPayment.grandTotal - discount;
                bookingPayment.discountAmount = discount;
                bookingPayment.promoCode = getPromoCode._id;
                bookingPayment.d = getPromoCode._id;
                yield bookingPayment.save();
                console.log(getPromoCode);
                console.log(getPromoCode);
                return res.status(200).json({
                    success: true,
                    type: "success",
                    data: getPromoCode,
                    message: "Promo Code is valid",
                });
            }
            else {
                return res.status(200).json({
                    success: false,
                    type: "success",
                    message: "Promo Code is already applied",
                });
            }
        }
        else {
            return res.status(200).json({
                success: false,
                status: 200,
                type: "error",
                message: "Promo Code is invalid",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.validatePromoCode = validatePromoCode;
const removePromoCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { bookingId } = req.body;
        const bookingPayment = yield bookingPayment_model_1.default.findOne({
            booking: (0, RequestHelper_1.ObjectId)(bookingId),
        });
        if (bookingPayment && bookingPayment.promoCode) {
            let discount = bookingPayment.discountAmount;
            bookingPayment.grandTotal = bookingPayment.grandTotal + discount;
            bookingPayment.discountAmount = 0;
            bookingPayment.promoCode = null;
            yield bookingPayment.save();
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Promo code removed successfully",
            });
        }
        else {
            return res.status(400).json({
                success: false,
                status: 200,
                message: "No promo code applied on this booking ",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            success: false,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.removePromoCode = removePromoCode;
const deletePromoCode = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { promoCodeId } = req.params;
    const { isDeleted } = req.body;
    try {
        const code = yield promoCode_model_1.default.findByIdAndUpdate((0, RequestHelper_1.ObjectId)(promoCodeId), {
            isDeleted: isDeleted,
        }, { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Promo code is deleted",
        });
    }
    catch (error) {
        // Handle any errors that occur during the update process
        return res.status(500).json({
            success: false,
            status: 500,
            message: "Internal Server Error",
            error: error.message,
        });
    }
});
exports.deletePromoCode = deletePromoCode;
