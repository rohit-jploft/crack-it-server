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
exports.getAllContactUs = exports.createContactLead = void 0;
const contact_model_1 = __importDefault(require("../../models/contact.model"));
const contact_schema_1 = require("../../schemas/contact.schema");
const pagination_1 = require("../../helper/pagination");
const createContactLead = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { error, value } = contact_schema_1.contactJoiSchema.validate(data);
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        const contact = yield contact_model_1.default.create(Object.assign({}, value));
        return res.status(200).json({
            status: 200,
            success: true,
            data: contact,
            message: "Contact submitted successfully",
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
exports.createContactLead = createContactLead;
const getAllContactUs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { search } = req.query;
    var query = {};
    const currentPage = Number((_a = req === null || req === void 0 ? void 0 : req.query) === null || _a === void 0 ? void 0 : _a.page) + 1 || 1;
    let limit = Number((_b = req === null || req === void 0 ? void 0 : req.query) === null || _b === void 0 ? void 0 : _b.limit) || 10;
    const skip = limit * (currentPage - 1);
    if (search) {
        query.$or = [
            { name: { $regex: search, $options: "i" } },
            { email: { $regex: search, $options: "i" } },
            { phone: { $regex: search, $options: "i" } },
        ];
    }
    try {
        const contacts = yield contact_model_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .sort({ createdAt: -1 });
        const totalCount = yield contact_model_1.default.countDocuments(query);
        return res.status(200).json({
            status: 200,
            success: true,
            data: contacts,
            pagination: (0, pagination_1.pagination)(totalCount, currentPage, limit),
            message: "Contact fetched successfully",
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
exports.getAllContactUs = getAllContactUs;
