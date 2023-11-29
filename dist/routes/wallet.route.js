"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const wallet_controller_1 = require("../controllers/Wallet/wallet.controller");
const router = express_1.default.Router();
// get users wallet
router.get("/get/:userId", wallet_controller_1.getUserWallet);
router.get("/transactions/get/:userId", wallet_controller_1.getUsersTransaction);
// create withdrawal request
router.post("/withdrawal/request/create", wallet_controller_1.createWithdrawRequest);
router.get("/withdrawal/get/all", wallet_controller_1.getAllWithdrawalReq);
// status update
router.put("/withdrawal/update/status/:id", wallet_controller_1.updateWithDrawalReq);
// wallet payment api
router.put("/payment/app", wallet_controller_1.payWithWallet);
exports.default = router;
