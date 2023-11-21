import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { createWithdrawRequest, getAllWithdrawalReq, getUserWallet, getUsersTransaction, payWithWallet, updateWithDrawalReq } from "../controllers/Wallet/wallet.controller";

const router: Router = express.Router();

// get users wallet
router.get("/get/:userId", getUserWallet);
router.get("/transactions/get/:userId", getUsersTransaction);

// create withdrawal request
router.post("/withdrawal/request/create", createWithdrawRequest);
router.get("/withdrawal/get/all", getAllWithdrawalReq);
// status update
router.put("/withdrawal/update/status/:id", updateWithDrawalReq);

// wallet payment api
router.put("/payment/app", payWithWallet)

export default router;