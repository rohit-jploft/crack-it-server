import express, { Router } from "express";
import AuthRoute from "./auth.route";
import CategoryRoutes from "./category.route";
import ExpertRoutes from "./expert.route";
import BookingRoutes from "./booking.route";
import RatingRoutes from "./rating.route";
import WalletRoute from "./wallet.route";
import AdminRoute from "./admin.route";
import CommissionRoute from "./commission.route";
import ChatRoute from "./chat.route";
import TimeZoneRoute from "./timeZone.route";
import BankRoute from "./bank.route";
import PromoCodeRoute from "./promo.route";
import PaymentRoute from "./payment.route";
import AgencyRoute from "./agency.route";
import ContactUs from "./contact.route";
import NotificationRoute from "./notification.route";

const router: Router = express.Router();

router.use("/auth", AuthRoute);
router.use("/category", CategoryRoutes);
router.use("/expert", ExpertRoutes);
router.use("/booking", BookingRoutes);
router.use("/rating", RatingRoutes);
router.use("/wallet", WalletRoute);
router.use("/admin", AdminRoute);
router.use("/commission", CommissionRoute);
router.use("/chat", ChatRoute);
router.use("/timezone", TimeZoneRoute);
router.use("/bank", BankRoute);
router.use("/promo", PromoCodeRoute);
router.use("/payment", PaymentRoute);
router.use("/agency", AgencyRoute);
router.use("/contacts", ContactUs);
router.use("/notification", NotificationRoute);

export default router;
