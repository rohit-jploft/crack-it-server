import express, { Router } from "express";
import AuthRoute from "./auth.route";
import CategoryRoutes from "./category.route";
import ExpertRoutes from "./expert.route";
import BookingRoutes from "./booking.route";
import RatingRoutes from "./rating.route";
import WalletRoute from "./wallet.route";
import AdminRoute from "./admin.route";
const router: Router = express.Router();

router.use("/auth", AuthRoute);
router.use("/category", CategoryRoutes);
router.use("/expert", ExpertRoutes);
router.use("/booking", BookingRoutes);
router.use("/rating", RatingRoutes);
router.use("/wallet", WalletRoute);
router.use("/admin", AdminRoute);

export default router;
