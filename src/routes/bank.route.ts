import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { createBankDetails, deleteBankOrUpi, getAllBankDetailsByUser } from "../controllers/Bank/bank.controller";


const router: Router = express.Router();

router.post("/add",  createBankDetails);
router.get("/get/all",  getAllBankDetailsByUser);
router.put("/delete/:bankId",  deleteBankOrUpi);


export default router;
