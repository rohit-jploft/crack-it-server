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
exports.getAllBankDetailsByUser = exports.createBankDetails = void 0;
const bank_model_1 = __importDefault(require("../../models/bank.model"));
const wallet_schema_1 = require("../../schemas/wallet.schema");
const RequestHelper_1 = require("../../helper/RequestHelper");
const createBankDetails = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // check validation error using JOI
        const { error, value } = wallet_schema_1.bankValidationSchema.validate(req.body);
        // Return if any validation error
        if (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
        const bank = new bank_model_1.default(value);
        yield bank.save();
        return res.status(200).json({
            success: true,
            status: 200,
            data: bank,
            message: value.type === "BANK"
                ? "Bank details added successfully"
                : "UPI Id added successfully",
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
exports.createBankDetails = createBankDetails;
const getAllBankDetailsByUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { user, type } = req.query;
    let query = { isDeleted: false };
    if (user) {
        query.user = (0, RequestHelper_1.ObjectId)(user.toString());
    }
    if (type)
        query.type = { $regex: type, $options: "i" };
    try {
        const details = yield bank_model_1.default.find(query);
        return res.status(200).json({
            success: true,
            status: 200,
            data: details,
            message: "Bank details fetched successfully",
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
exports.getAllBankDetailsByUser = getAllBankDetailsByUser;
