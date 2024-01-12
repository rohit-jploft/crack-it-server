import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createCategory,
  deleteCategory,
  getAllCategoryWithNoOfExpert,
  getAllcategory,
  updateCategory,
} from "../controllers/Category/category.controller";
import upload from "../middlewares/fileUploader";

const router: Router = express.Router();

router.post(
  "/create",
  upload.fields([{ name: "image", maxCount: 1 }]),
  createCategory
);
router.put(
  "/update/:categoryId",
  upload.fields([{ name: "image", maxCount: 1 }]),
  updateCategory
);
router.put("/delete/:categoryId", deleteCategory);
router.get("/get-all", getAllcategory);

router.get("/home/get/all", getAllCategoryWithNoOfExpert);

export default router;
