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
exports.getDeviceToken = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const getDeviceToken = (userId, type) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const userData = yield user_model_1.default.findById(userId);
        if (type) {
            return type === "web"
                ? userData === null || userData === void 0 ? void 0 : userData.webDeviceToken
                : userData === null || userData === void 0 ? void 0 : userData.appDeviceToken;
        }
        return userData === null || userData === void 0 ? void 0 : userData.webDeviceToken;
    }
    catch (error) {
        return error.message;
    }
});
exports.getDeviceToken = getDeviceToken;
