"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middlewares/checkAuth");
const auth_controller_1 = require("../controllers/Authentication/auth.controller");
const admin_controller_1 = require("../controllers/Admin/admin.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/user/signup", auth_controller_1.createNewUser);
router.post("/agency/signup", auth_controller_1.createNewAgency);
router.post("/user/login", auth_controller_1.loginUser);
router.put("/user/delete/:userId", auth_controller_1.deleteAccount);
router.delete("/user/permanent/delete/:userId", auth_controller_1.permanentDeleteAccount);
router.get("/user/detail", checkAuth_1.isAuthenticated, auth_controller_1.getUserDetail);
router.get("/user/profile/get/:userId", auth_controller_1.getUserProfileById);
//save profile picture
router.put("/user/set/profile/:userId", fileUploader_1.default.fields([{ name: "profilePic", maxCount: 1 }]), auth_controller_1.setProfilePicOfUser);
router.put("/user/set/avatar/:userId", auth_controller_1.setAvatarProfilePicture);
// chnage password
router.post("/user/change-password", checkAuth_1.isAuthenticated, auth_controller_1.changePassword);
// forgot password
router.post("/user/forgot-password/send-otp", auth_controller_1.forgotPasswordsendOtp);
router.post("/user/forgot-password/verify-otp", fileUploader_1.default.none(), auth_controller_1.forgotPasswordVerifyOtp);
router.post("/user/forgot-password/set-password", checkAuth_1.isAuthenticated, auth_controller_1.setNewPassword);
// admin APIs
router.get("/users/all", admin_controller_1.getAllUsers);
exports.default = router;
