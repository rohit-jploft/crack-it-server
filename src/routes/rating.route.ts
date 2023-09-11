import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { rateExpert } from "../controllers/Rating/rating.controller";

const router: Router = express.Router();

router.post("/create", rateExpert);

export default router;