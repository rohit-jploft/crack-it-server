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
  loginUser,
  permanentDeleteAccount,
  setNewPassword,
} from "../controllers/Authentication/auth.controller";
import { getAllUsers } from "../controllers/Admin/admin.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/user/signup", createNewUser);
router.post("/agency/signup", createNewAgency);
router.post("/user/login", loginUser);
router.put("/user/delete/:userId", deleteAccount);
router.delete("/user/permanent/delete/:userId", permanentDeleteAccount);
router.get("/user/detail",isAuthenticated, getUserDetail);

// chnage password
router.post('/user/change-password', isAuthenticated, changePassword)


// forgot password
router.post("/user/forgot-password/send-otp", forgotPasswordsendOtp);
router.post("/user/forgot-password/verify-otp",upload.none(), forgotPasswordVerifyOtp);
router.post("/user/forgot-password/set-password", isAuthenticated,setNewPassword);


// admin APIs

router.get("/users/all", getAllUsers)

export default router;
