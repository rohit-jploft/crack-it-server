import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { getUserWallet } from "../controllers/Wallet/wallet.controller";

const router: Router = express.Router();

router.get("/get/:userId", getUserWallet);

export default router;