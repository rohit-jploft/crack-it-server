import { Response, Request, NextFunction } from "express";
import User from "../models/user.model";
import {
  AUTH_TOKEN_MISSING_ERR,
  AUTH_HEADER_MISSING_ERR,
  JWT_DECODE_ERR,
  USER_NOT_FOUND_ERR,
} from "../utils/error";
import { verifyJwtToken } from "../utils/token.util";
import { Roles } from "../utils/role";

export const isAuthenticated = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // check for auth header from client
    const header = req.headers.authorization;

    if (!header) {
      next({ status: 403, message: AUTH_HEADER_MISSING_ERR });
      return;
    }

    // verify  auth token
    const token = header.split("Bearer ")[1];
    if (!token) {
      next({ status: 403, message: AUTH_TOKEN_MISSING_ERR });
      return;
    }

    const userId = verifyJwtToken(token, next);

    if (!userId) {
      next({ status: 403, message: JWT_DECODE_ERR });
      return;
    }

    const user = await User.findById(userId).populate("role");

    if (!user) {
      next({ status: 404, message: USER_NOT_FOUND_ERR });
      return;
    }
    res.locals.user = user;

    next();
  } catch (err) {
    next(err);
  }
};

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
