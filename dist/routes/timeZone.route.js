"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const timeZone_controller_1 = require("../controllers/timeZone.controller");
const router = express_1.default.Router();
router.get("/get/all", timeZone_controller_1.getAllTimeZones);
exports.default = router;
