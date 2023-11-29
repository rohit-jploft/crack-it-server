"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyJwtToken = exports.createJwtToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const constant_1 = require("./constant");
const createJwtToken = (payload, expiresIn) => {
    const token = jsonwebtoken_1.default.sign(payload, constant_1.JWT_SECRET, { expiresIn: expiresIn ? expiresIn : "360h" });
    return token;
};
exports.createJwtToken = createJwtToken;
const verifyJwtToken = (token, next) => {
    try {
        const { userId } = jsonwebtoken_1.default.verify(token, constant_1.JWT_SECRET);
        return userId;
    }
    catch (err) {
        next(err);
        return null;
    }
};
exports.verifyJwtToken = verifyJwtToken;
