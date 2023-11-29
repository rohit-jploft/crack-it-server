"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const Notification_controller_1 = require("../controllers/Notifications/Notification.controller");
const router = express_1.default.Router();
router.get("/get-all/:userId", Notification_controller_1.getAllNotificationsByUser);
router.put("/read/:notificationId", Notification_controller_1.notificationReaded);
router.put("/save/deviceToken/:userId", Notification_controller_1.saveDeviceTokenInDb);
exports.default = router;
