import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  AgencyProfileSetup,
  deleteAgencyExpert,
  getAgencyProfile,
  getAllAgencyExperts,
  updateAgencyExpert,
  addNewAgencyExpert,
} from "../controllers/Agency/agency.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/profile/setup", upload.none(), AgencyProfileSetup);
router.post(
  "/add/expert",
  upload.fields([{ name: "profilePic", maxCount: 1 }]),
  addNewAgencyExpert
);
router.get("/experts/all/:agencyId", getAllAgencyExperts);
router.get("/profile/:agencyId", getAgencyProfile);
router.put("/expert/update/:expertId", updateAgencyExpert);
router.delete("/expert/delete/:userId", deleteAgencyExpert);

export default router;
