import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";

import upload from "../middlewares/fileUploader";
import { getAllNotificationsByUser , notificationReaded, saveDeviceTokenInDb} from "../controllers/Notifications/Notification.controller";

const router: Router = express.Router();


router.get("/get-all/:userId", getAllNotificationsByUser);
router.put("/read/:notificationId", notificationReaded);
router.put("/save/deviceToken/:userId", saveDeviceTokenInDb);

export default router;
