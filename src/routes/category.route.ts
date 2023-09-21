import express, { Router } from "express";

import { isAuthenticated } from "../middlewares/checkAuth";
import {
  createCategory,
  deleteCategory,
  getAllcategory,
  updateCategory,
} from "../controllers/Category/category.controller";

const router: Router = express.Router();

router.post("/create", createCategory);
router.put("/update/:categoryId", updateCategory);
router.put("/delete/:categoryId", deleteCategory);
router.get("/get-all", getAllcategory);

export default router;
