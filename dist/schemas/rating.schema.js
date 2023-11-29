"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const expertRatingSchema = joi_1.default.object({
    rating: joi_1.default.number().min(1).max(5).required(),
    expert: joi_1.default.string().required(),
    bookingId: joi_1.default.string().required(),
    ratedBy: joi_1.default.string().required(),
    comment: joi_1.default.string().allow("").default(''), // Assuming 'comment' is a string in Joi
});
exports.default = expertRatingSchema;
