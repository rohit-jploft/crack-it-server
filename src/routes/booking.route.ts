import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  acceptBooking,
    cancelBooking,
  createBooking,
  getAllBooking,
  getAllBookingPayments,
  getSingleBookingDetail,
} from "../controllers/Booking/booking.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/create", upload.fields([]), createBooking);
router.get("/get-all", getAllBooking);
router.get("/single/:bookingId", getSingleBookingDetail);
router.put("/cancel/:bookingId", cancelBooking);
router.put("/accept/:bookingId", acceptBooking);
router.get("/payments", getAllBookingPayments);

export default router;
