"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AgencyExpertiseSchemaSchema = exports.expertSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the Joi schema for the Expert model
exports.expertSchema = joi_1.default.object({
    user: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().required(),
    languages: joi_1.default.array().items(joi_1.default.string()),
    experience: joi_1.default.number().required(),
    jobCategory: joi_1.default.string().required(),
    expertise: joi_1.default.array().items(joi_1.default.string()),
});
exports.AgencyExpertiseSchemaSchema = joi_1.default.object({
    agency: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    languages: joi_1.default.array().items(joi_1.default.string()),
    experience: joi_1.default.number().required(),
    jobCategory: joi_1.default.string().required(),
    expertise: joi_1.default.array().items(joi_1.default.string()),
});
