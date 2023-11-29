"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const bank_controller_1 = require("../controllers/Bank/bank.controller");
const router = express_1.default.Router();
router.post("/add", bank_controller_1.createBankDetails);
router.get("/get/all", bank_controller_1.getAllBankDetailsByUser);
exports.default = router;
