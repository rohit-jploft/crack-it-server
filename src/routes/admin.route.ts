import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { getAllUsers, getDashboardData, getPaymentPageStats } from "../controllers/Admin/admin.controller";


const router: Router = express.Router();

router.get("/dashboard/data", getDashboardData);
router.get("/user/list/all", getAllUsers);
router.get("/payments/stats", getPaymentPageStats);


export default router;
