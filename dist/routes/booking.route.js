"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const booking_controller_1 = require("../controllers/Booking/booking.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/create", fileUploader_1.default.fields([]), booking_controller_1.createBooking);
router.get("/get-all", booking_controller_1.getAllBooking);
router.get("/single/:bookingId", booking_controller_1.getSingleBookingDetail);
router.put("/cancel/:bookingId", booking_controller_1.cancelBooking);
router.put("/accept/:bookingId", booking_controller_1.acceptBooking);
router.put("/decline/:bookingId", booking_controller_1.declinedBooking);
router.get("/payments", booking_controller_1.getAllBookingPayments);
exports.default = router;
