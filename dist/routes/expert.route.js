"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const experts_controller_1 = require("../controllers/Experts/experts.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/profile/setup", fileUploader_1.default.fields([]), experts_controller_1.expertProfileSetup);
router.put("/profile/update/:userId", fileUploader_1.default.fields([]), experts_controller_1.updateExpert);
router.get("/get/profile/:userId", experts_controller_1.getExpertProfile);
router.get("/get/all", experts_controller_1.getAllExpertBasedOnSearch);
exports.default = router;
