import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { createCommission, deleteCommission, getAllCommission, updateCommission } from "../controllers/Commission/commission.controller";


const router: Router = express.Router();

router.post("/create", createCommission);
router.put("/update/:commissionId", updateCommission);
router.put("/delete/:commissionId", deleteCommission);
router.get("/get-all", getAllCommission);

export default router;
