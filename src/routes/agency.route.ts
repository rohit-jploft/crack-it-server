import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  AgencyProfileSetup,
  deleteAgencyExpert,
  getAllAgencyExperts,
  updateAgencyExpert,
} from "../controllers/Agency/agency.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/profile/setup", upload.none(), AgencyProfileSetup);
router.get("/experts/all/:agencyId", getAllAgencyExperts);
router.put("/expert/update/:expertId", updateAgencyExpert);
router.delete("/expert/delete/:userId", deleteAgencyExpert);

export default router;
