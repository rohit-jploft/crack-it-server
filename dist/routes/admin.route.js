"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const admin_controller_1 = require("../controllers/Admin/admin.controller");
const router = express_1.default.Router();
router.get("/dashboard/data", admin_controller_1.getDashboardData);
router.get("/user/list/all", admin_controller_1.getAllUsers);
router.get("/payments/stats", admin_controller_1.getPaymentPageStats);
exports.default = router;
