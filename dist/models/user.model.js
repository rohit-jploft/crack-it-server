"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const role_1 = require("../utils/role");
const userSchema = new mongoose_1.Schema({
    firstName: {
        type: String,
        trim: true,
        default: "",
    },
    agencyName: {
        type: String
    },
    lastName: {
        type: String,
        trim: true,
        default: "",
    },
    agency: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    phone: {
        type: Number,
        trim: true,
        unique: true,
    },
    countryCode: {
        type: String,
    },
    role: {
        type: String,
        enum: ["SUPER_ADMIN", "USER", "ADMIN", "EXPERT", "AGENCY"],
        default: role_1.Roles.USER,
    },
    profilePhoto: {
        type: String
    },
    webDeviceToken: {
        type: String
    },
    appDeviceToken: {
        type: String
    },
    timeZone: {
        type: String,
    },
    email: {
        type: String,
        trim: true,
        default: "",
        unique: true,
    },
    isExpertProfileVerified: {
        type: Boolean,
        default: false
    },
    password: {
        type: String,
    },
    referBy: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: "User"
    },
    isPhoneVerified: {
        type: Boolean,
        default: false,
    },
    isEmailVerified: {
        type: Boolean,
        default: false,
    },
    termAndConditions: {
        type: Boolean,
        require: true,
    },
    isDeleted: {
        type: Boolean,
        default: false,
    },
}, { timestamps: true });
const User = (0, mongoose_1.model)("User", userSchema);
exports.default = User;
