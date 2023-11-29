"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const category_controller_1 = require("../controllers/Category/category.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/create", fileUploader_1.default.fields([{ name: "image", maxCount: 1 }]), category_controller_1.createCategory);
router.put("/update/:categoryId", fileUploader_1.default.fields([{ name: "image", maxCount: 1 }]), category_controller_1.updateCategory);
router.put("/delete/:categoryId", category_controller_1.deleteCategory);
router.get("/get-all", category_controller_1.getAllcategory);
exports.default = router;
