import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createCategory,
  deleteCategory,
  getAllcategory,
  updateCategory,
} from "../controllers/Category/category.controller";

const router: Router = express.Router();

router.post("/create", isAuthenticated, createCategory);
router.put("/update/:categoryId", isAuthenticated, updateCategory);
router.put("/delete/:categoryId", isAuthenticated, deleteCategory);
router.get("/get-all", isAuthenticated, getAllcategory);

export default router;
