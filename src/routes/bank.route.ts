import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { createBankDetails, getAllBankDetailsByUser } from "../controllers/Bank/bank.controller";


const router: Router = express.Router();

router.post("/add",  createBankDetails);
router.get("/get/all",  getAllBankDetailsByUser);


export default router;
