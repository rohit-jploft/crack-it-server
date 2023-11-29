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
exports.checkVerification = exports.sendVerification = void 0;
const twilio_1 = __importDefault(require("twilio"));
// import { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SERVICE_SID } from './constant';
const { TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_VERIFICATION_SERVICE_SID, } = process.env;
const client = (0, twilio_1.default)(TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN);
// Send verification
const sendVerification = (number, countryCode) => __awaiter(void 0, void 0, void 0, function* () {
    const verification = yield client.verify.v2
        .services(TWILIO_VERIFICATION_SERVICE_SID)
        .verifications.create({ to: `${countryCode}${number}`, channel: "sms" });
    console.log(verification);
    return verification.status;
});
exports.sendVerification = sendVerification;
// Check verification token
const checkVerification = (countryCode, number, Otpcode) => __awaiter(void 0, void 0, void 0, function* () {
    const verify = yield client.verify.v2
        .services(TWILIO_VERIFICATION_SERVICE_SID)
        .verificationChecks.create({
        to: `${countryCode}${number}`,
        code: Otpcode,
    });
    return JSON.parse(JSON.stringify(verify));
});
exports.checkVerification = checkVerification;
