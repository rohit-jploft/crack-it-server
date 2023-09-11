import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
    cancelBooking,
  createBooking,
  getAllBooking,
} from "../controllers/Booking/booking.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/create", upload.fields([]), createBooking);
router.get("/get-all", getAllBooking);
router.put("/cancel/:bookingId", cancelBooking);

export default router;
