import express, { Router } from "express";
import { createPaymentIntent } from "../controllers/Payment/payment.controller";




const router: Router = express.Router();

router.post('/intent/create', createPaymentIntent)



export default router;