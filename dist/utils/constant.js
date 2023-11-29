"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.timeZoneList = exports.JWT_SECRET = exports.NODE_ENV = exports.PORT = exports.MONGO_URI = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.MONGO_URI = process.env.MONGO_URI;
exports.PORT = process.env.PORT;
exports.NODE_ENV = process.env.NODE_ENV;
exports.JWT_SECRET = process.env.JWT_SECRET;
exports.timeZoneList = [
    { "offsetMinutes": -720, "symbol": "IDLW", "name": "International Date Line West" },
    { "offsetMinutes": -600, "symbol": "HST", "name": "Hawaii-Aleutian Standard Time" },
    { "offsetMinutes": -540, "symbol": "AKST", "name": "Alaska Standard Time" },
    { "offsetMinutes": -480, "symbol": "PST", "name": "Pacific Standard Time" },
    { "offsetMinutes": -420, "symbol": "MST", "name": "Mountain Standard Time" },
    { "offsetMinutes": -360, "symbol": "CST", "name": "Central Standard Time" },
    { "offsetMinutes": -300, "symbol": "EST", "name": "Eastern Standard Time" },
    { "offsetMinutes": -240, "symbol": "AST", "name": "Atlantic Standard Time" },
    { "offsetMinutes": -210, "symbol": "NST", "name": "Newfoundland Standard Time" },
    { "offsetMinutes": 0, "symbol": "UTC", "name": "Coordinated Universal Time" },
    { "offsetMinutes": 0, "symbol": "GMT", "name": "Greenwich Mean Time" },
    { "offsetMinutes": 60, "symbol": "CET", "name": "Central European Time" },
    { "offsetMinutes": 120, "symbol": "EET", "name": "Eastern European Time" },
    { "offsetMinutes": 180, "symbol": "MSK", "name": "Moscow Standard Time" },
    { "offsetMinutes": 330, "symbol": "IST", "name": "Indian Standard Time" },
    { "offsetMinutes": 480, "symbol": "CST", "name": "China Standard Time" },
    { "offsetMinutes": 540, "symbol": "JST", "name": "Japan Standard Time" },
    { "offsetMinutes": 600, "symbol": "AEST", "name": "Australian Eastern Standard Time" },
    { "offsetMinutes": 720, "symbol": "NZST", "name": "New Zealand Standard Time" }
];
