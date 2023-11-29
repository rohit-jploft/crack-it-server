"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const PromoCode_controller_1 = require("../controllers/promoCode/PromoCode.controller");
const router = express_1.default.Router();
router.post("/code/create", PromoCode_controller_1.createPromoCode);
router.get("/code/get/single/:promoCodeId", PromoCode_controller_1.getPromoCodeById);
router.get("/code/get/all", PromoCode_controller_1.getAllPromoCodes);
router.put("/code/apply", PromoCode_controller_1.validatePromoCode);
router.put("/code/remove", PromoCode_controller_1.removePromoCode);
router.put("/code/update/:promoCodeId", PromoCode_controller_1.updatePromoCodeById);
router.put("/code/active/:promoCodeId", PromoCode_controller_1.makeActive);
router.put("/code/delete/:promoCodeId", PromoCode_controller_1.deletePromoCode);
exports.default = router;
