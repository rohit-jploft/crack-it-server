import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import { rateExpert } from "../controllers/Rating/rating.controller";
import {
  addFeedBackbyAdmin,
  addReason,
  changeTicketStatus,
  createIssueTicket,
  deleteReason,
  getAllReasonList,
  getAllTickets,
  updateReason,
} from "../controllers/RaiseIssue/raiseIssue.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post(
  "/raise",
  upload.fields([{ name: "doc", maxCount: 1 }]),
  createIssueTicket
);

router.get("/get-all", getAllTickets);
router.put("/update/status/:ticketId", changeTicketStatus);

// feedback add api by admin

router.put("/feedback/add/:ticketId", addFeedBackbyAdmin);

// ticket reason API's

router.post("/reason/create", addReason);
router.put("/reason/update/:reasonId", updateReason);
router.get("/reason/get-all", getAllReasonList);
router.put("/reason/delete/:reasonId", deleteReason);

export default router;
