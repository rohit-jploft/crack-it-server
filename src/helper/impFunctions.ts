import User from "../models/user.model";
import { Roles } from "../utils/role";

export const getSuperAdminId = async () => {
  try {
    const superAdmin: any = await User.findOne({ role: Roles.SUPER_ADMIN });
    if (superAdmin) {
      return superAdmin._id;
    }
    return null;
  } catch (error) {
    return error;
  }
};
