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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendNotification = void 0;
const admin = require("firebase-admin");
const serviceAccount = require("../../firebase_config.json");
admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
});
const sendNotification = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const payload = {
        notification: {
            title: data.title,
            body: data.message,
        },
        token: data.token,
        data: data === null || data === void 0 ? void 0 : data.data,
    };
    admin
        .messaging()
        .send(payload)
        .then((response) => {
        console.log("Successfully sent message:", response);
    })
        .catch((error) => {
        console.log("Error sending message:", error);
    });
});
exports.sendNotification = sendNotification;
module.exports.admin = admin;
