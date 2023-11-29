"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.agencyExpertSchema = void 0;
const joi_1 = __importDefault(require("joi"));
// Define the Joi schema for the Expert model
exports.agencyExpertSchema = joi_1.default.object({
    firstName: joi_1.default.string().required(),
    lastName: joi_1.default.string().required(),
    email: joi_1.default.string().required(),
    phone: joi_1.default.number().required(),
    password: joi_1.default.string().required(),
    agency: joi_1.default.string().required(),
    description: joi_1.default.string().required(),
    price: joi_1.default.number().required(),
    languages: joi_1.default.array().items(joi_1.default.string()),
    experience: joi_1.default.number().required(),
    jobCategory: joi_1.default.string().required(),
    expertise: joi_1.default.array().items(joi_1.default.string()),
    profilePhoto: joi_1.default.string()
});
