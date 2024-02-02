import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  ReBookingWithCancelledBoooking,
  acceptBooking,
  bookingPageDashboard,
  cancelBooking,
  createBooking,
  declinedBooking,
  getAllBooking,
  getAllBookingPayments,
  getSingleBookingDetail,
} from "../controllers/Booking/booking.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post("/create", upload.fields([]), createBooking);
router.post("/re-booking/:bookingId", ReBookingWithCancelledBoooking);

router.get("/get-all", getAllBooking);
router.get("/single/:bookingId", getSingleBookingDetail);
router.put("/cancel/:bookingId", cancelBooking);
router.put("/accept/:bookingId", acceptBooking);
router.put("/decline/:bookingId", declinedBooking);
router.get("/payments", getAllBookingPayments);

// booking dashboard user logged

router.get("/dashboard/user", bookingPageDashboard);

export default router;
