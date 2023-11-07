import express, { Router } from "express";
import { checkAndVerifyPayment, createPaymentIntent } from "../controllers/Payment/payment.controller";




const router: Router = express.Router();

router.post('/intent/create', createPaymentIntent)
router.put('/intent/check', checkAndVerifyPayment)



export default router;