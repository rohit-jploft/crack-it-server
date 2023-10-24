import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";

import upload from "../middlewares/fileUploader";
import {
  createPromoCode,
  deletePromoCode,
  getAllPromoCodes,
  getPromoCodeById,
  makeActive,
  removePromoCode,
  updatePromoCodeById,
  validatePromoCode,
} from "../controllers/promoCode/PromoCode.controller";

const router: Router = express.Router();

router.post("/code/create", createPromoCode);
router.get("/code/get/single/:promoCodeId", getPromoCodeById);
router.get("/code/get/all", getAllPromoCodes);
router.put("/code/apply", validatePromoCode);
router.put("/code/remove", removePromoCode);
router.put("/code/update/:promoCodeId", updatePromoCodeById);
router.put("/code/active/:promoCodeId", makeActive);
router.put("/code/delete/:promoCodeId", deletePromoCode);

export default router;
