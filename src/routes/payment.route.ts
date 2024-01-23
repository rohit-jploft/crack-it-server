import express, { Router } from "express";
import {
  checkAndVerifyPayment,
  createPaymentIntent,
  createTransactionForMobileIntentCreatedByApp,
  payAndProceedWhenAmountZero,
  payThroughWallet,
  payThroughWalletMobileApi,
} from "../controllers/Payment/payment.controller";

const router: Router = express.Router();

router.post("/intent/create", createPaymentIntent);
router.put("/intent/check", checkAndVerifyPayment);
router.put("/wallet", payThroughWallet);

router.put("/api/mobile/wallet", payThroughWalletMobileApi);

// api used to create pending transaction before proceeding for payment
router.post(
  "/api/mobile/create/transaction/intent",
  createTransactionForMobileIntentCreatedByApp
);

// payment when amount is zero
router.put("/booking/zero/:bookingId", payAndProceedWhenAmountZero);

export default router;
