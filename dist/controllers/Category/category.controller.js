"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteCategory = exports.updateCategory = exports.getAllcategory = exports.createCategory = void 0;
const category_model_1 = __importDefault(require("../../models/category.model"));
const category_schema_1 = require("../../schemas/category.schema");
const RequestHelper_1 = require("../../helper/RequestHelper");
const pagination_1 = require("../../helper/pagination");
// create category api
const createCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const data = req.body;
        console.log(data);
        if (req === null || req === void 0 ? void 0 : req.files) {
            var { image } = req === null || req === void 0 ? void 0 : req.files;
            var image = ((_b = (_a = image[0]) === null || _a === void 0 ? void 0 : _a.path) === null || _b === void 0 ? void 0 : _b.replaceAll("\\", "/")) || "";
        }
        // Check validation error using JOI
        const { value, error } = category_schema_1.CategorySchema.validate(data);
        // Return if any validation error
        if (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
        // Save the company details
        const category = yield category_model_1.default.create(Object.assign(Object.assign({}, value), { image: image }));
        return res.status(200).json({
            status: 200,
            success: true,
            data: category,
            message: "Category created Successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.createCategory = createCategory;
// get all category API
const getAllcategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _c, _d;
    let { parent, search } = req.query;
    // pagination query data
    const currentPage = Number((_c = req === null || req === void 0 ? void 0 : req.query) === null || _c === void 0 ? void 0 : _c.page) + 1 || 1;
    let limit = Number((_d = req === null || req === void 0 ? void 0 : req.query) === null || _d === void 0 ? void 0 : _d.limit) || 10;
    const skip = limit * (currentPage - 1);
    // filter query data
    var query = { isDeleted: false };
    if (parent)
        query.parent = (0, RequestHelper_1.ObjectId)(parent.toString());
    if (!parent)
        query.parent = { $exists: false };
    if (search)
        query.title = { $regex: search.toString(), $options: "i" };
    try {
        const catorgies = yield category_model_1.default.find(query).populate('parent')
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        // TOTAL COUNT
        const totalCount = yield category_model_1.default.countDocuments(query);
        return res.status(200).json({
            status: 200,
            success: true,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            data: catorgies,
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getAllcategory = getAllcategory;
// update the category
const updateCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _e, _f;
    const data = req.body;
    let { categoryId } = req.params;
    // Check validation error using JOI
    const { value, error } = category_schema_1.CategorySchema.validate(data);
    if (req === null || req === void 0 ? void 0 : req.files) {
        var { image } = req === null || req === void 0 ? void 0 : req.files;
        var image = ((_f = (_e = image[0]) === null || _e === void 0 ? void 0 : _e.path) === null || _f === void 0 ? void 0 : _f.replaceAll("\\", "/")) || "";
    }
    // Return if any validation error
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        var payload = {};
        if (data.title)
            payload.title = value.title;
        if (data.parent)
            payload.parent = value.parent;
        if (image)
            payload.image = image;
        // Save the company details
        const category = yield category_model_1.default.findByIdAndUpdate(categoryId, Object.assign({}, payload), { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            data: category,
            message: "Category Updated Successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.updateCategory = updateCategory;
// delete category
const deleteCategory = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    let { categoryId } = req.params;
    try {
        // Save the company details
        const category = yield category_model_1.default.findByIdAndUpdate(categoryId, {
            isDeleted: true,
        }, { new: true });
        return res.status(200).json({
            success: true,
            status: 200,
            message: "Category Deleted Successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.deleteCategory = deleteCategory;
