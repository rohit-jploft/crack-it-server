import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createNewUser,
  deleteAccount,
  loginUser,
} from "../controllers/Authentication/auth.controller";
import { getAllUsers } from "../controllers/Admin/admin.controller";

const router: Router = express.Router();

router.post("/user/signup", createNewUser);
router.post("/user/login", loginUser);
router.post("/user/delete/:userId", deleteAccount);


// admin APIs

router.get("/users/all", getAllUsers)

export default router;
