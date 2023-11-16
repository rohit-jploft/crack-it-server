import express, { Router } from "express";
import { checkAndVerifyPayment, createPaymentIntent, payThroughWallet } from "../controllers/Payment/payment.controller";




const router: Router = express.Router();

router.post('/intent/create', createPaymentIntent)
router.put('/intent/check', checkAndVerifyPayment)
router.put('/wallet', payThroughWallet)



export default router;