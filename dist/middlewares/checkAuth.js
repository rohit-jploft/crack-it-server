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
exports.isAuthenticated = void 0;
const user_model_1 = __importDefault(require("../models/user.model"));
const error_1 = require("../utils/error");
const token_util_1 = require("../utils/token.util");
const isAuthenticated = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // check for auth header from client
        const header = req.headers.authorization;
        if (!header) {
            next({ status: 403, message: error_1.AUTH_HEADER_MISSING_ERR });
            return;
        }
        // verify  auth token
        const token = header.split("Bearer ")[1];
        console.log(token);
        if (!token) {
            next({ status: 403, message: error_1.AUTH_TOKEN_MISSING_ERR });
            return;
        }
        const userId = (0, token_util_1.verifyJwtToken)(token, next);
        if (!userId) {
            next({ status: 403, message: error_1.JWT_DECODE_ERR });
            return;
        }
        const user = yield user_model_1.default.findById(userId).populate("role");
        if (!user) {
            next({ status: 404, message: error_1.USER_NOT_FOUND_ERR });
            return;
        }
        res.locals.user = user;
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.isAuthenticated = isAuthenticated;
// const isSuperAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const role = res.locals.user.role;
//   const getSuperAdmin = await Role.findOne({ name: Roles.SUPER_ADMIN });
//   if (role._id.toString() !== getSuperAdmin?._id.toString()) {
//     return res.status(402).json({
//       success: false,
//       message: "You need to be a super admin to access this resource",
//     });
//   }
//   next();
// };
// const isCompanyAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const role = res.locals.user.role;
//   const getCompanyAdmin = await Role.findOne({ name: Roles.COMPANY });
//   if (role._id.toString() !== getCompanyAdmin?._id.toString()) {
//     return res.status(402).json({
//       success: false,
//       message: "You need to be a company admin to access this resource",
//     });
//   }
//   next();
// };
// const isRestaurantAdmin = async (
//   req: Request,
//   res: Response,
//   next: NextFunction
// ): Promise<Response | void> => {
//   const role = res.locals.user.role;
//   const getRestaurantAdmin = await Role.findOne({ name: Roles.RESTAURANT });
//   if (role._id.toString() !== getRestaurantAdmin?._id.toString()) {
//     return res.status(402).json({
//       success: false,
//       message: "You need to be a restaurant admin to access this resource",
//     });
//   }
//   next();
// };
// export { isSuperAdmin, isCompanyAdmin, isRestaurantAdmin };
