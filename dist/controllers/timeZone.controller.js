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
exports.getAllTimeZones = void 0;
const timeZone_model_1 = __importDefault(require("../models/timeZone.model"));
const getAllTimeZones = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const TimesZones = yield timeZone_model_1.default.find();
        return res.status(200).json({
            success: true,
            status: 200,
            data: TimesZones,
            message: "all timeZones fetched successfully"
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
exports.getAllTimeZones = getAllTimeZones;
