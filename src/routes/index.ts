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

export default router;
