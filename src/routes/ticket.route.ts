import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { rateExpert } from "../controllers/Rating/rating.controller";
import {
  createIssueTicket,
  getAllTickets,
} from "../controllers/RaiseIssue/raiseIssue.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post(
  "/raise",
  upload.fields([{ name: "doc", maxCount: 1 }]),
  createIssueTicket
);

router.get("/get-all", getAllTickets);

export default router;
