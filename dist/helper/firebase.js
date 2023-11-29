"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const firebase_admin_1 = __importDefault(require("firebase-admin"));
const firebaseConfig = {
    apiKey: "AIzaSyCR43VTwx11WjV95PiBf6HJMIayXxrh7zY",
    authDomain: "crackit-d3bfb.firebaseapp.com",
    projectId: "crackit-d3bfb",
    storageBucket: "crackit-d3bfb.appspot.com",
    messagingSenderId: "767742891503",
    appId: "1:767742891503:web:526c1e6910092ac33ad21a",
    measurementId: "G-W2XG2EHR99"
};
firebase_admin_1.default.initializeApp({
    credential: firebase_admin_1.default.credential.cert(firebaseConfig),
});
module.exports = { firebase: firebase_admin_1.default };
