"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const joi_1 = __importDefault(require("joi"));
const notificationSchema = joi_1.default.object({
    sender: joi_1.default.string().required(),
    receiver: joi_1.default.string().required(),
    title: joi_1.default.string().required(),
    message: joi_1.default.string().required(),
    data: joi_1.default.object().default({}),
    dynamicData: joi_1.default.object().default({}),
});
exports.default = notificationSchema;
