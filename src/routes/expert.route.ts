import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  expertProfileSetup,
  getAllExpertsProfile,
  getExpertProfile,
} from "../controllers/Experts/experts.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/profile/setup",upload.fields([]), expertProfileSetup);
router.get("/get/profile/:userId", getExpertProfile);
router.get("/get/all", getAllExpertsProfile);

export default router;
