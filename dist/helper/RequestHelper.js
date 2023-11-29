"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.buildResult = exports.ObjectId = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const buildResult = (res, status, result, pagination, error, message) => {
    if (error) {
        // Generate error response
        return res.status(status).json({
            statusCode: status,
            message: error.message,
            data: {},
        });
    }
    else {
        // Generate success response
        return res.status(status).json({
            statusCode: status,
            message: message ? message : "SUCCESS",
            data: result,
            pagination: pagination,
        });
    }
};
exports.buildResult = buildResult;
const ObjectId = (id) => {
    return new mongoose_1.default.Types.ObjectId(id);
};
exports.ObjectId = ObjectId;
