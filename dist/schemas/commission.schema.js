"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.commissionJoiSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the Joi schema for CommissionData
const commissionJoiSchema = joi_1.default.object({
    title: joi_1.default.string().required(),
    type: joi_1.default.string().valid('PERCENT', 'FIXED').required(),
    percent: joi_1.default.number().when('type', {
        is: 'PERCENT',
        then: joi_1.default.number().required(),
        otherwise: joi_1.default.number(),
    }),
    amount: joi_1.default.number().when('type', {
        is: 'FIXED',
        then: joi_1.default.number().required(),
        otherwise: joi_1.default.number(),
    }),
});
exports.commissionJoiSchema = commissionJoiSchema;
