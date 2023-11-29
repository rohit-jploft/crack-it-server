"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
exports.addNewAgencyExpert = exports.getAgencyProfile = exports.deleteAgencyExpert = exports.getAllAgencyExperts = exports.updateAgencyExpert = exports.AgencyProfileSetup = void 0;
const experts_schema_1 = require("../../schemas/experts.schema");
const agency_model_1 = __importDefault(require("../../models/agency.model"));
const user_model_1 = __importDefault(require("../../models/user.model"));
const experts_model_1 = __importDefault(require("../../models/experts.model"));
const RequestHelper_1 = require("../../helper/RequestHelper");
const rating_controller_1 = require("../Rating/rating.controller");
const agency_schema_1 = require("../../schemas/agency.schema");
const wallet_controller_1 = require("../Wallet/wallet.controller");
const bcrypt = __importStar(require("bcrypt"));
const error_1 = require("../../utils/error");
const role_1 = require("../../utils/role");
const AgencyProfileSetup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // Check validation error using JOI
        const { value, error } = experts_schema_1.AgencyExpertiseSchemaSchema.validate(data);
        console.log(value, "values");
        // Return if any validation error
        if (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
        // check role is expert or not
        const userData = yield user_model_1.default.findById(value.agency);
        if (userData) {
            userData.isExpertProfileVerified = true;
            yield userData.save();
        }
        // Save the company details
        const experts = yield agency_model_1.default.findOne({ agency: data.agency });
        if (experts) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Agency Profile is already set",
            });
        }
        else {
            var AgencyexpData = yield agency_model_1.default.create(Object.assign({}, value));
        }
        return res.status(200).json({
            status: 200,
            success: true,
            data: AgencyexpData,
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
exports.AgencyProfileSetup = AgencyProfileSetup;
const updateAgencyExpert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { expertId } = req.params;
    try {
        const exp = yield agency_model_1.default.findOne({
            agency: (0, RequestHelper_1.ObjectId)(expertId.toString()),
        });
        if (!exp) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Expert not found",
            });
        }
        exp.description = data.description ? data.description : exp.description;
        exp.price = data.price ? data.price : exp.price;
        exp.language = data.language ? data.language : exp.language;
        exp.expertise = data.expertise ? data.expertise : exp.expertise;
        exp.jobCategory = data.jobCategory ? data.jobCategory : exp.jobCategory;
        exp.experience = (data === null || data === void 0 ? void 0 : data.experience) ? data === null || data === void 0 ? void 0 : data.experience : exp.experience;
        yield exp.save();
        return res.status(200).json({
            status: 200,
            success: true,
            data: exp,
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
exports.updateAgencyExpert = updateAgencyExpert;
// list of agency experts
const getAllAgencyExperts = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agencyId } = req.params;
    try {
        const experts = yield experts_model_1.default.find({ agency: (0, RequestHelper_1.ObjectId)(agencyId) })
            .populate("user", "firstName lastName email phone role profilePhoto")
            .populate("jobCategory", "title")
            .populate("agency", "agencyName")
            .populate("expertise", "title");
        console.log(experts);
        return res.status(200).json({
            status: 200,
            success: true,
            data: experts,
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
exports.getAllAgencyExperts = getAllAgencyExperts;
const deleteAgencyExpert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const user = yield user_model_1.default.deleteOne({ _id: (0, RequestHelper_1.ObjectId)(userId) });
        const expert = yield experts_model_1.default.deleteOne({ user: (0, RequestHelper_1.ObjectId)(userId) });
        return res.status(200).json({
            status: 200,
            success: true,
            message: "Agency experts deleted successfully",
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
exports.deleteAgencyExpert = deleteAgencyExpert;
const getAgencyProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { agencyId } = req.params;
    try {
        const getExpertsData = yield agency_model_1.default.findOne({
            agency: (0, RequestHelper_1.ObjectId)(agencyId),
        })
            .populate("agency", "agencyName email phone countryCode isExpertProfileVerified profilePhoto")
            .populate("expertise", "title")
            .populate("jobCategory", "title");
        const rating = yield (0, rating_controller_1.getAgencyRating)(agencyId.toString());
        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                expert: getExpertsData,
                rating,
            },
            message: "agency profile detail",
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
exports.getAgencyProfile = getAgencyProfile;
const addNewAgencyExpert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = req.body;
    // Check validation error using JOI
    const { value, error } = agency_schema_1.agencyExpertSchema.validate(data);
    console.log(data);
    console.log(req === null || req === void 0 ? void 0 : req.files);
    if (req.files) {
        var { profilePic } = req === null || req === void 0 ? void 0 : req.files;
        if (!profilePic) {
            return res.status(200).json({
                success: false,
                status: 206,
                message: "Profile pic is required",
            });
        }
        var media = ((_b = (_a = profilePic[0]) === null || _a === void 0 ? void 0 : _a.path) === null || _b === void 0 ? void 0 : _b.replaceAll("\\", "/")) || "";
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
        // check user exists or not
        const IsUserExist = yield user_model_1.default.findOne({
            $or: [{ email: value.email.toLowerCase() }, { phone: value.phone }],
        });
        // if user exists
        if (IsUserExist) {
            return res.status(200).json({
                status: 200,
                success: false,
                type: "error",
                message: error_1.USER_ALREADY_EXISTS,
            });
        }
        else {
            // if user does not exist in our database
            // then create a new user in db
            const hashedPassword = yield bcrypt.hash(value.password, 12);
            const newUser = yield user_model_1.default.create({
                firstName: value.firstName,
                lastName: value.lastName,
                email: value.email.toLowerCase(),
                phone: value.phone,
                role: role_1.Roles.EXPERT,
                agency: value.agency,
                profilePhoto: value.profilePhoto,
                password: hashedPassword,
                countryCode: value.countryCode,
                termAndConditions: true,
                isExpertProfileVerified: true,
            });
            // save
            yield (0, wallet_controller_1.createWallet)(newUser._id.toString());
            const newExpert = yield experts_model_1.default.create({
                user: newUser._id,
                description: value.description,
                agency: value.agency,
                price: value.price,
                languages: value.languages,
                experience: value.experience,
                jobCategory: value.jobCategory,
                expertise: value.expertise,
            });
            return res.status(200).json({
                status: 200,
                success: true,
                data: newExpert,
                message: "New Agency expert created successfully",
            });
        }
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
exports.addNewAgencyExpert = addNewAgencyExpert;
