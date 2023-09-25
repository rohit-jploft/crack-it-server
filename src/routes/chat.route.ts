import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createConvoApi,
  getConvoMessage,
  getUsersConversation,
  searchConversations,
  sendMessage,
} from "../controllers/Chat/chat.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/conversation/create/:meetingId", createConvoApi);
router.get("/conversation/user/:userId", getUsersConversation);
router.get("/conversation/messages/:convoId", getConvoMessage);
router.post(
  "/message/send",
  upload.fields([{ name: "audio", maxCount: 1 }]),
  sendMessage
);

// search conversations
router.get("/search", searchConversations);

export default router;
