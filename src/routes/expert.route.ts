import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  expertProfileSetup,
  getAllExpertBasedOnSearch,
  getAllHighestRatedExpert,
  getExpertProfile,
  updateExpert,
} from "../controllers/Experts/experts.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/profile/setup", upload.fields([]), expertProfileSetup);
router.put("/profile/update/:userId", upload.fields([]), updateExpert);
router.get("/get/profile/:userId", getExpertProfile);
router.get("/get/all", getAllExpertBasedOnSearch);
router.get("/rating/get/all", getAllHighestRatedExpert);

export default router;
