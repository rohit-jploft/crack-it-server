"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const agency_controller_1 = require("../controllers/Agency/agency.controller");
const fileUploader_1 = __importDefault(require("../middlewares/fileUploader"));
const router = express_1.default.Router();
router.post("/profile/setup", fileUploader_1.default.none(), agency_controller_1.AgencyProfileSetup);
router.post("/add/expert", fileUploader_1.default.fields([{ name: "profilePic", maxCount: 1 }]), agency_controller_1.addNewAgencyExpert);
router.get("/experts/all/:agencyId", agency_controller_1.getAllAgencyExperts);
router.get("/profile/:agencyId", agency_controller_1.getAgencyProfile);
router.put("/expert/update/:expertId", agency_controller_1.updateAgencyExpert);
router.delete("/expert/delete/:userId", agency_controller_1.deleteAgencyExpert);
exports.default = router;
