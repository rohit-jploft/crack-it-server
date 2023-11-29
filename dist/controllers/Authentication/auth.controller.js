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
exports.setAvatarProfilePicture = exports.setProfilePicOfUser = exports.setNewPassword = exports.forgotPasswordVerifyOtp = exports.forgotPasswordsendOtp = exports.changePassword = exports.getUserProfileById = exports.getUserDetail = exports.permanentDeleteAccount = exports.deleteAccount = exports.loginUser = exports.createNewAgency = exports.createNewUser = void 0;
const auth_shema_1 = require("../../schemas/auth.shema");
const user_model_1 = __importDefault(require("../../models/user.model"));
const bcrypt = __importStar(require("bcrypt"));
const error_1 = require("../../utils/error");
const token_util_1 = require("../../utils/token.util");
const RequestHelper_1 = require("../../helper/RequestHelper");
const wallet_controller_1 = require("../Wallet/wallet.controller");
const experts_model_1 = __importDefault(require("../../models/experts.model"));
const role_1 = require("../../utils/role");
const fs_1 = require("fs");
const createNewUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    let data = req.body;
    let role = (_a = req === null || req === void 0 ? void 0 : req.body) === null || _a === void 0 ? void 0 : _a.role;
    // check validation error using JOI
    const { error, value } = auth_shema_1.signupSchema.validate(data);
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    // check user exists or not
    const IsUserExist = yield user_model_1.default.findOne({
        $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
    });
    // if user exists
    if (IsUserExist) {
        return res.status(200).json({
            status: 200,
            success: false,
            type: "error",
            message: error_1.USER_ALREADY_EXISTS,
        });
    }
    else {
        // if user does not exist in our database
        // then create a new user in db
        const hashedPassword = yield bcrypt.hash(value.password, 12);
        try {
            const newUser = yield user_model_1.default.create({
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email.toLowerCase(),
                phone: value.phone,
                role: value.role ? value.role : role_1.Roles.USER,
                password: hashedPassword,
                referBy: value.referBy ? value.referBy : null,
                countryCode: value.countryCode,
                termAndConditions: true,
            });
            // save
            yield (0, wallet_controller_1.createWallet)(newUser._id.toString());
            // return the success response for account creation
            return res.status(200).json({
                type: "success",
                success: true,
                status: 200,
                message: "Account created successfully",
                data: {
                    userId: newUser._id,
                    firstName: newUser.firstName,
                    lastName: newUser.lastName,
                },
            });
        }
        catch (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
    }
});
exports.createNewUser = createNewUser;
const createNewAgency = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    let data = req.body;
    let role = (_b = req === null || req === void 0 ? void 0 : req.body) === null || _b === void 0 ? void 0 : _b.role;
    // check validation error using JOI
    const { error, value } = auth_shema_1.AgencysignupSchema.validate(data);
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    // check user exists or not
    const IsUserExist = yield user_model_1.default.findOne({
        $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
    });
    // if user exists
    if (IsUserExist) {
        return res.status(200).json({
            status: 200,
            success: false,
            type: "error",
            message: error_1.USER_ALREADY_EXISTS,
        });
    }
    else {
        // if user does not exist in our database
        // then create a new user in db
        const hashedPassword = yield bcrypt.hash(value.password, 12);
        try {
            const newUser = yield user_model_1.default.create({
                agencyName: value.agencyName,
                email: value.email.toLowerCase(),
                phone: value.phone,
                role: "AGENCY",
                password: hashedPassword,
                countryCode: value.countryCode,
                termAndConditions: true,
            });
            // save
            yield (0, wallet_controller_1.createWallet)(newUser._id.toString());
            // return the success response for account creation
            return res.status(200).json({
                type: "success",
                success: false,
                status: 200,
                message: "Account created successfully",
                data: {
                    userId: newUser._id,
                    name: newUser.agencyName,
                },
            });
        }
        catch (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
    }
});
exports.createNewAgency = createNewAgency;
const loginUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { email, password, role } = req.body;
    // check validation error using JOI
    const { error, value } = auth_shema_1.loginSchema.validate({ email, password });
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        // check user exists or not
        var IsUserExist = yield user_model_1.default.findOne({
            email: email.toLowerCase(),
        });
        console.log(IsUserExist);
        if (role && role.toUpperCase() != (IsUserExist === null || IsUserExist === void 0 ? void 0 : IsUserExist.role)) {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 306,
                message: `You need to be an ${role}`,
            });
        }
        if (IsUserExist === null || IsUserExist === void 0 ? void 0 : IsUserExist.isDeleted) {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 306,
                message: "Account is suspended",
            });
        }
        if (!IsUserExist) {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 406,
                message: error_1.USER_NOT_FOUND_ERR,
            });
        }
        else {
            const doMatch = yield bcrypt.compare(password, IsUserExist.password);
            if (doMatch) {
                const token = (0, token_util_1.createJwtToken)({ userId: IsUserExist._id });
                const { firstName, lastName, email, _id, role, phone, isExpertProfileVerified, } = IsUserExist;
                const response = {
                    success: true,
                    status: 200,
                    data: {
                        token: token,
                        user: {
                            _id,
                            firstName,
                            lastName,
                            email,
                            phone,
                            role,
                            isExpertProfileVerified,
                        },
                    },
                    message: "Login SuccessFully",
                };
                return res.status(200).json(response);
            }
            else {
                return res
                    .status(200)
                    .json({ status: 401, type: "error", message: error_1.INCORRECT_PASSWORD });
            }
        }
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.loginUser = loginUser;
//suspend account
const deleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { isDeleted } = req.body;
    console.log(isDeleted, "isDeleted");
    try {
        const tempDeleteUser = yield user_model_1.default.findOneAndUpdate((0, RequestHelper_1.ObjectId)(userId), { isDeleted: isDeleted }, { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            message: `Account ${isDeleted ? "Suspended" : "Active"} Successfully`,
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
exports.deleteAccount = deleteAccount;
// permanent delete accunt
const permanentDeleteAccount = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield user_model_1.default.findOne({ _id: (0, RequestHelper_1.ObjectId)(userId) });
        if ((user === null || user === void 0 ? void 0 : user.role) === role_1.Roles.EXPERT) {
            const expert = yield experts_model_1.default.deleteOne({ user: (0, RequestHelper_1.ObjectId)(userId) });
            yield user_model_1.default.deleteOne({ _id: (0, RequestHelper_1.ObjectId)(userId) });
        }
        yield user_model_1.default.deleteOne({ _id: (0, RequestHelper_1.ObjectId)(userId) });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Your account deleted permanently",
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
exports.permanentDeleteAccount = permanentDeleteAccount;
const getUserDetail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user._id;
    try {
        const userData = yield user_model_1.default.findOne((0, RequestHelper_1.ObjectId)(userId));
        return res.status(200).json({
            success: true,
            status: 200,
            data: userData,
            message: "Account details fetched successfully",
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
exports.getUserDetail = getUserDetail;
const getUserProfileById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const userData = yield experts_model_1.default.findOne({ user: (0, RequestHelper_1.ObjectId)(userId) }).populate("user jobCategory");
        if (!userData) {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 406,
                message: error_1.USER_NOT_FOUND_ERR,
            });
        }
        return res.status(200).json({
            success: true,
            status: 200,
            data: userData,
            message: "Account details fetched successfully",
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
exports.getUserProfileById = getUserProfileById;
const changePassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { oldPassword, password } = req.body;
    // check validation error using JOI
    const { error, value } = auth_shema_1.changePasswordSchema.validate({
        oldPassword,
        password,
    });
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    const userId = res.locals.user._id;
    try {
        const userData = yield user_model_1.default.findById((0, RequestHelper_1.ObjectId)(userId));
        if (!userData) {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 406,
                message: error_1.USER_NOT_FOUND_ERR,
            });
        }
        const doMatch = yield bcrypt.compare(oldPassword, userData.password);
        if (doMatch) {
            const hashedPassword = yield bcrypt.hash(password, 12);
            userData.password = hashedPassword;
            yield userData.save();
            return res.status(200).json({
                success: true,
                type: "success",
                status: 200,
                message: "Password changed successfully",
            });
        }
        else {
            return res.status(200).json({
                success: false,
                type: "error",
                status: 406,
                message: "Incorrect old password",
            });
        }
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.changePassword = changePassword;
const forgotPasswordsendOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { mobile, countryCode } = req.body;
    try {
        const checkUser = yield user_model_1.default.findOne({
            $or: [{ phone: mobile }],
            countryCode: countryCode,
        });
        console.log(checkUser);
        if (!checkUser) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "User not found",
            });
        }
        if (mobile && countryCode) {
            // const sendSms = await sendVerification(mobile, countryCode);
            // if (sendSms) console.log(sendSms);
            return res.status(200).json({
                success: true,
                status: 200,
                message: "Otp sent successfully",
            });
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});
exports.forgotPasswordsendOtp = forgotPasswordsendOtp;
const forgotPasswordVerifyOtp = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log(req.body);
        const { mobile, countryCode, otp } = req.body;
        const user = yield user_model_1.default.findOne({
            phone: mobile,
            countryCode: countryCode,
        });
        if (!user) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "User not found",
            });
        }
        if (mobile && countryCode && otp) {
            // const verifyOtp = await checkVerification(countryCode, mobile, otp);
            console.log(typeof otp);
            const verifyOtp = {
                valid: otp == 123456 ? true : false,
            };
            if (verifyOtp && verifyOtp.valid) {
                const token = (0, token_util_1.createJwtToken)({ userId: user._id }, "1h");
                return res.status(200).json({
                    success: true,
                    status: 200,
                    data: {
                        token,
                    },
                    message: "Otp verified",
                });
            }
            else {
                return res.status(200).json({
                    success: false,
                    status: 203,
                    message: "Invalid OTP",
                });
            }
        }
    }
    catch (error) {
        return res.status(500).json({
            status: 500,
            message: error.message,
        });
    }
});
exports.forgotPasswordVerifyOtp = forgotPasswordVerifyOtp;
const setNewPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const userId = res.locals.user._id;
    const { password } = req.body;
    try {
        const hashedPassword = yield bcrypt.hash(password, 12);
        const userData = yield user_model_1.default.findByIdAndUpdate(userId, {
            password: hashedPassword,
        });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "password is changed successfully",
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
exports.setNewPassword = setNewPassword;
const setProfilePicOfUser = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    const { userId } = req.params;
    try {
        if (req === null || req === void 0 ? void 0 : req.files) {
            var { profilePic } = req === null || req === void 0 ? void 0 : req.files;
            if (!profilePic) {
                return res.status(200).json({
                    success: false,
                    status: 206,
                    message: "Profile pic is required",
                });
            }
            var media = ((_d = (_c = profilePic[0]) === null || _c === void 0 ? void 0 : _c.path) === null || _d === void 0 ? void 0 : _d.replaceAll("\\", "/")) || "";
            console.log(profilePic);
            console.log((0, RequestHelper_1.ObjectId)(userId.toString()), "id");
            const user = yield user_model_1.default.findOneAndUpdate({ _id: (0, RequestHelper_1.ObjectId)(userId.toString()) }, {
                profilePhoto: media,
            });
            if (user && user.profilePhoto) {
                profilePic &&
                    (0, fs_1.existsSync)(user.profilePhoto) &&
                    (0, fs_1.unlinkSync)(user.profilePhoto);
            }
            return res.status(200).json({
                success: true,
                status: 200,
                data: user,
                message: "Profile pic saved",
            });
        }
    }
    catch (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.setProfilePicOfUser = setProfilePicOfUser;
const setAvatarProfilePicture = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    const { avatar } = req.body;
    try {
        const setUsersAvatar = yield user_model_1.default.findById((0, RequestHelper_1.ObjectId)(userId));
        if (!setUsersAvatar) {
            return res.status(200).json({
                status: 200,
                success: false,
                type: "error",
                message: "user not found",
            });
        }
        setUsersAvatar.profilePhoto = avatar;
        yield setUsersAvatar.save();
        return res.status(200).json({
            success: true,
            status: 200,
            data: setUsersAvatar,
            message: "Profile pic saved",
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
exports.setAvatarProfilePicture = setAvatarProfilePicture;
// export const saveTimeZoneForUser = async 
