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
exports.deleteCommission = exports.updateCommission = exports.getAllCommission = exports.createCommission = void 0;
const commission_schema_1 = require("../../schemas/commission.schema");
const commission_model_1 = __importDefault(require("../../models/commission.model"));
// create commission api
const createCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // Check validation error using JOI
        const { value, error } = commission_schema_1.commissionJoiSchema.validate(data);
        // Return if any validation error
        if (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
        // Save the commission details
        const commission = yield commission_model_1.default.create(value);
        return res.status(200).json({
            status: 200,
            success: true,
            data: commission,
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
exports.createCommission = createCommission;
// get all commission API
const getAllCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { type } = req.query;
    var query = { isDeleted: false };
    if (type)
        query.type = { $regex: type.toString(), $options: "i" };
    try {
        const commission = yield commission_model_1.default.find(query);
        return res.status(200).json({
            status: 200,
            success: true,
            data: commission,
            message: "commission fetched successfully"
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
exports.getAllCommission = getAllCommission;
// update the commission
const updateCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    let { commissionId } = req.params;
    // Check validation error using JOI
    //   const { value, error } = commissionJoiSchema.validate(data);
    // Return if any validation error
    //   if (error) {
    //     return res.status(403).json({
    //       success: false,
    //       status: 403,
    //       message: error.message,
    //     });
    //   }
    try {
        var payload = {};
        if (data.title)
            payload.title = data.title;
        if (data.type)
            payload.type = data.type;
        if (data.percent)
            payload.percent = data.percent;
        if (data.amount)
            payload.amount = data.amount;
        // Save the commission details
        const commission = yield commission_model_1.default.findByIdAndUpdate(commissionId, Object.assign({}, payload), { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            data: commission,
            message: "commission Updated Successfully",
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
exports.updateCommission = updateCommission;
// delete category
const deleteCommission = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { commissionId } = req.params;
    try {
        // Save the commission details
        const commission = yield commission_model_1.default.findByIdAndUpdate(commissionId, {
            isDeleted: true,
        }, { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "commission Deleted Successfully",
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
exports.deleteCommission = deleteCommission;
