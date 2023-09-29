import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  changePassword,
  createNewUser,
  deleteAccount,
  // forgotPasswordVerifyOtp,
  // forgotPasswordsendOtp,
  getUserDetail,
  loginUser,
  // setNewPassword,
} from "../controllers/Authentication/auth.controller";
import { getAllUsers } from "../controllers/Admin/admin.controller";

const router: Router = express.Router();

router.post("/user/signup", createNewUser);
router.post("/user/login", loginUser);
router.put("/user/delete/:userId", deleteAccount);
router.get("/user/detail",isAuthenticated, getUserDetail);

// chnage password
router.post('/user/change-password', isAuthenticated, changePassword)


// forgot password
// router.post("/user/forgot-password/send-otp", forgotPasswordsendOtp);
// router.post("/user/forgot-password/verify-otp", forgotPasswordVerifyOtp);
// router.post("/user/forgot-password/set-password", isAuthenticated,setNewPassword);


// admin APIs

router.get("/users/all", getAllUsers)

export default router;
