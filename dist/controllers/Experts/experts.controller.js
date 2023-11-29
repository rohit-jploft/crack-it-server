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
exports.updateExpert = exports.getAllExpertBasedOnSearch = exports.getExpertProfile = exports.expertProfileSetup = void 0;
const RequestHelper_1 = require("../../helper/RequestHelper");
const experts_model_1 = __importDefault(require("../../models/experts.model"));
// import expertSchema from "../../schemas/experts.schema";
const user_model_1 = __importDefault(require("../../models/user.model"));
const rating_controller_1 = require("../Rating/rating.controller");
const experts_schema_1 = require("../../schemas/experts.schema");
// expert profile setup API
const expertProfileSetup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const data = req.body;
        // Check validation error using JOI
        const { value, error } = experts_schema_1.expertSchema.validate(data);
        console.log(data);
        // Return if any validation error
        if (error) {
            return res.status(403).json({
                success: false,
                status: 403,
                message: error.message,
            });
        }
        console.log(value);
        // check role is expert or not
        const userData = yield user_model_1.default.findById(value.user);
        if (userData) {
            userData.isExpertProfileVerified = true;
            yield userData.save();
        }
        // Save the company details
        const experts = yield experts_model_1.default.findOne({ user: data.user });
        if (experts) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Profile is already set",
            });
        }
        else {
            var expData = yield experts_model_1.default.create(Object.assign({}, value));
        }
        return res.status(200).json({
            status: 200,
            success: true,
            data: expData,
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
exports.expertProfileSetup = expertProfileSetup;
// get experts profile by userId
const getExpertProfile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const getExpertsData = yield experts_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)(userId),
        })
            .populate("user", "firstName lastName email phone countryCode isExpertProfileVerified profilePhoto")
            .populate("expertise", "title")
            .populate("jobCategory", "title");
        const rating = yield (0, rating_controller_1.getExpertRating)(userId.toString());
        return res.status(200).json({
            status: 200,
            success: true,
            data: {
                expert: getExpertsData,
                rating,
            },
            message: "Experts profile detail",
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
exports.getExpertProfile = getExpertProfile;
// query type for the below API
// type TitleRegex = {
//   $regex: string;
//   $options: string;
// };
// type queryData = {
//   parent?: Types.ObjectId | { $exists: boolean };
//   isDeleted: boolean;
//   title: TitleRegex;
// };
// export const getAllExpertsProfile = async (req: Request, res: Response) => {
//   const { search, categories } = req.query;
//   var query = {};
//   try {
//     const profiles = await Expert.find();
//     return res.status(200).json({
//       status: 200,
//       success: true,
//       data: profiles,
//       message: "Experts profiles fetched",
//     });
//   } catch (error: any) {
//     // Return error if anything goes wrong
//     return res.status(403).json({
//       success: false,
//       status: 403,
//       message: error.message,
//     });
//   }
// };
const getAllExpertBasedOnSearch = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let { jobCategory, skills, search, startPrice, endPrice, minExperience, maxExperience, rating, typeOfExpert, } = req.query;
        console.log(jobCategory);
        let expertise = skills === null || skills === void 0 ? void 0 : skills.toString().split(",").map((item) => item.trim());
        const pipeline = [];
        var typeLength;
        if (typeOfExpert) {
            typeOfExpert = typeOfExpert.toString().split(",");
            typeLength = typeOfExpert.length;
        }
        if (jobCategory) {
            pipeline.push({
                $match: {
                    jobCategory: (0, RequestHelper_1.ObjectId)(jobCategory.toString()),
                },
            });
        }
        if (typeOfExpert && typeLength === 1) {
            if (typeOfExpert[0] === "AGENCY") {
                pipeline.push({
                    $match: {
                        agency: { $exists: true },
                    },
                });
            }
            if (typeOfExpert[0] === "EXPERT") {
                pipeline.push({
                    $match: {
                        agency: { $exists: false },
                    },
                });
            }
        }
        if (skills && (expertise === null || expertise === void 0 ? void 0 : expertise.length) > 0) {
            pipeline.push({
                $match: {
                    expertise: { $in: expertise },
                },
            });
        }
        if (startPrice && endPrice) {
            pipeline.push({
                $match: {
                    price: {
                        $gte: parseInt(startPrice.toString()),
                        $lte: parseInt(endPrice.toString()),
                    },
                },
            });
        }
        if (minExperience && maxExperience) {
            pipeline.push({
                $match: {
                    experience: {
                        $gte: parseInt(minExperience.toString()),
                        $lte: parseInt(maxExperience.toString()),
                    },
                },
            });
        }
        pipeline.push({
            $lookup: {
                from: "users",
                localField: "user",
                foreignField: "_id",
                as: "user",
                pipeline: [
                    {
                        $project: {
                            firstName: 1,
                            lastName: 1,
                            phone: 1,
                            countryCode: 1,
                            profilePhoto: 1,
                            email: 1,
                        },
                    },
                ],
            },
        });
        pipeline.push({
            $unwind: {
                path: "$user",
            },
        });
        pipeline.push({
            $lookup: {
                from: "categories",
                localField: "jobCategory",
                foreignField: "_id",
                as: "jobCategory",
            },
        });
        pipeline.push({
            $unwind: {
                path: "$jobCategory",
            },
        });
        pipeline.push({
            $lookup: {
                from: "categories",
                localField: "expertise",
                foreignField: "_id",
                as: "expertise",
            },
        });
        // pipeline.push({
        //   $unwind: {
        //     path: "$expertiseData",
        //     preserveNullAndEmptyArrays: true,
        //   },
        // });
        if (search) {
            pipeline.push({
                $match: {
                    $or: [
                        { "user.firstName": { $regex: search, $options: "i" } },
                        { "user.lastName": { $regex: search, $options: "i" } },
                    ],
                },
            });
        }
        const experts = yield experts_model_1.default.aggregate(pipeline);
        const list = yield Promise.all(experts.map((expert) => __awaiter(void 0, void 0, void 0, function* () {
            const rating = yield (0, rating_controller_1.getExpertRating)(expert.user._id.toString());
            return Object.assign(Object.assign({}, expert), { rating: rating });
        })));
        let finalList;
        if (rating) {
            finalList = yield Promise.all(list.filter((exprt) => {
                return parseInt(exprt.rating.toString()) >= parseInt(`${rating}`);
            }));
        }
        console.log(list, "list");
        console.log(finalList, "final list");
        return res.status(200).json({
            success: true,
            status: 200,
            data: rating ? finalList : list,
            message: "Experts are listed according to your interest",
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
exports.getAllExpertBasedOnSearch = getAllExpertBasedOnSearch;
const updateExpert = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = req.body;
    const { userId } = req.params;
    console.log(data, "update data");
    try {
        const exp = yield experts_model_1.default.findOne({
            user: (0, RequestHelper_1.ObjectId)(userId.toString()),
        });
        const user = yield user_model_1.default.findOne({
            _id: (0, RequestHelper_1.ObjectId)(userId.toString()),
        });
        if (!exp) {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Expert not found",
            });
        }
        user.firstName = data.firstName ? data.firstName : user.firstName;
        user.lastName = data.lastName ? data.lastName : user.lastName;
        exp.description = data.description ? data.description : exp.description;
        exp.price = data.price ? data.price : exp.price;
        exp.languages = data.language ? data.language : exp.languages;
        exp.expertise = data.expertise ? data.expertise : exp.expertise;
        exp.jobCategory = data.jobCategory ? data.jobCategory : exp.jobCategory;
        exp.experience = (data === null || data === void 0 ? void 0 : data.experience) ? data === null || data === void 0 ? void 0 : data.experience : exp.experience;
        yield exp.save();
        yield user.save();
        return res.status(200).json({
            status: 200,
            success: true,
            data: exp,
            message: "Expert profile updated successfully",
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
exports.updateExpert = updateExpert;
