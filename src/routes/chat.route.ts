import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createConvoApi,
  getConvoMessage,
  getUsersConversation,
  searchConversations,
  sendMessage,
} from "../controllers/Chat/chat.controller";

const router: Router = express.Router();

router.post("/conversation/create/:meetingId", createConvoApi);
router.get("/conversation/user/:userId", getUsersConversation);
router.get("/conversation/messages/:convoId", getConvoMessage);
router.post("/message/send", sendMessage);

// search conversations
router.get('/search', searchConversations)

export default router;
