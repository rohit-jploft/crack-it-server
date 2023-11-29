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
exports.AgencysignupSchema = exports.changePasswordSchema = exports.loginSchema = exports.signupSchema = void 0;
const Joi = __importStar(require("joi"));
const role_1 = require("../utils/role");
const signupSchema = Joi.object().keys({
    firstName: Joi.string().required(),
    lastName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid(role_1.Roles.SUPER_ADMIN, role_1.Roles.USER, role_1.Roles.ADMIN, role_1.Roles.EXPERT),
    referBy: Joi.string().allow(""),
    countryCode: Joi.string(),
    phone: Joi.number(),
    termAndConditions: Joi.bool().valid(true),
});
exports.signupSchema = signupSchema;
const AgencysignupSchema = Joi.object().keys({
    agencyName: Joi.string().required(),
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string().valid("AGENCY"),
    countryCode: Joi.string(),
    phone: Joi.number(),
    termAndConditions: Joi.bool().valid(true),
});
exports.AgencysignupSchema = AgencysignupSchema;
const loginSchema = Joi.object().keys({
    password: Joi.string().required(),
    email: Joi.string().email().required(),
    role: Joi.string(),
});
exports.loginSchema = loginSchema;
const changePasswordSchema = Joi.object().keys({
    oldPassword: Joi.string().required(),
    password: Joi.string().required(),
});
exports.changePasswordSchema = changePasswordSchema;
