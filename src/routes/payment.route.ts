import express, { Router } from "express";
import {
  checkAndVerifyPayment,
  createPaymentIntent,
  createTransactionForMobileIntentCreatedByApp,
  payThroughWallet,
  payThroughWalletMobileApi,
} from "../controllers/Payment/payment.controller";

const router: Router = express.Router();

router.post("/intent/create", createPaymentIntent);
router.put("/intent/check", checkAndVerifyPayment);
router.put("/wallet", payThroughWallet);

router.put("/api/mobile/wallet", payThroughWalletMobileApi);

router.post(
  "/api/mobile/create/transaction/intent",
  createTransactionForMobileIntentCreatedByApp
);

export default router;
