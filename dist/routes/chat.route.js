"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const checkAuth_1 = require("../middlewares/checkAuth");
const chat_controller_1 = require("../controllers/Chat/chat.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/conversation/create/:meetingId", chat_controller_1.createConvoApi);
router.get("/conversation/user/:userId", chat_controller_1.getUsersConversation);
router.get("/conversation/messages/:convoId", chat_controller_1.getConvoMessage);
router.get("/get/from/meeting/:meetingId", chat_controller_1.getChatFromMeetingId);
router.post("/message/send", fileUploader_1.default.fields([{ name: "audio", maxCount: 1 }]), chat_controller_1.sendMessage);
router.post("/enter/admin", checkAuth_1.isAuthenticated, chat_controller_1.enterChatForAdmin);
// search conversations
router.get("/search", chat_controller_1.searchConversations);
exports.default = router;
