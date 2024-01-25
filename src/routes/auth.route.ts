import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  changePassword,
  createNewAgency,
  createNewUser,
  deleteAccount,
  forgotPasswordVerifyOtp,
  forgotPasswordsendOtp,
  getUserDetail,
  getUserProfileById,
  logOutApi,
  loginUser,
  permanentDeleteAccount,
  setAvatarProfilePicture,
  setNewPassword,
  setProfilePicOfUser,
} from "../controllers/Authentication/auth.controller";
import { getAllUsers } from "../controllers/Admin/admin.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/user/signup", createNewUser);
router.post("/agency/signup", createNewAgency);
router.post("/user/login", loginUser);

router.put("/user/logout/:userId", logOutApi)

router.put("/user/delete/:userId", deleteAccount);
router.delete("/user/permanent/delete/:userId", permanentDeleteAccount);
router.get("/user/detail", isAuthenticated, getUserDetail);

router.get("/user/profile/get/:userId", getUserProfileById);
//save profile picture

router.put(
  "/user/set/profile/:userId",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  setProfilePicOfUser
);
router.put("/user/set/avatar/:userId", setAvatarProfilePicture);

// chnage password
router.post("/user/change-password", isAuthenticated, changePassword);

// forgot password
router.post("/user/forgot-password/send-otp", forgotPasswordsendOtp);
router.post(
  "/user/forgot-password/verify-otp",
  upload.none(),
  forgotPasswordVerifyOtp
);
router.post(
  "/user/forgot-password/set-password",
  isAuthenticated,
  setNewPassword
);

// admin APIs

router.get("/users/all", getAllUsers);

export default router;
