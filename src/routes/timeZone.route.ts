import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { getAllTimeZones } from "../controllers/timeZone.controller";


const router: Router = express.Router();

router.get("/get/all", getAllTimeZones);




export default router;
