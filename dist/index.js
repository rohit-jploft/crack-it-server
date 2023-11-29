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
const express_1 = __importDefault(require("express"));
const mongoose_1 = __importDefault(require("mongoose"));
const cors_1 = __importDefault(require("cors"));
const node_schedule_1 = __importDefault(require("node-schedule"));
const dotenv = __importStar(require("dotenv"));
const constant_1 = require("./utils/constant");
const error_1 = require("./utils/error");
const socketUsers_1 = require("./helper/socketUsers");
const body_parser_1 = __importDefault(require("body-parser"));
const index_1 = __importDefault(require("./routes/index"));
const path_1 = __importDefault(require("path"));
const socket_io_1 = require("socket.io");
const http_1 = __importDefault(require("http"));
const https_1 = __importDefault(require("https"));
const fs_1 = __importDefault(require("fs"));
const os_1 = __importDefault(require("os"));
const chat_model_1 = __importDefault(require("./models/chat.model"));
const RequestHelper_1 = require("./helper/RequestHelper");
const bookingScheduler_1 = require("./scheduler/bookingScheduler");
const rating_controller_1 = require("./controllers/Rating/rating.controller");
//dot env
dotenv.config();
// Initiate express app
const app = (0, express_1.default)();
// Middleware
// online users
const onlineUsers = new Map();
app.use((0, cors_1.default)({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
}));
if (constant_1.NODE_ENV === "development") {
    const morgan = require("morgan");
    app.use(morgan("dev"));
}
// Apply middlewares
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({
    extended: true,
}));
app.use(body_parser_1.default.json({ limit: "1024mb" }), body_parser_1.default.urlencoded({
    limit: "1024mb",
    extended: true,
}), (0, cors_1.default)()
// morgan('dev')
);
// Serve static files
const staticPath = path_1.default.join(__dirname, "..", "uploads"); // Define the path to your static files
app.use("/uploads", express_1.default.static(staticPath));
// Welcome route
app.get("/", (req, res) => {
    res.status(200).json({
        type: "SUCCESS",
        message: "SERVER IS UP AND RUNNING",
        data: null,
    });
});
// Routes
app.use("/", index_1.default);
node_schedule_1.default.scheduleJob("* * * * *", bookingScheduler_1.makeStatusFromConfirmedToCompleted);
node_schedule_1.default.scheduleJob("* * * * *", bookingScheduler_1.startChatForConfirmedBookingBefore15Min);
app.use("*", (req, res, next) => {
    const error = {
        status: 404,
        message: error_1.API_ENDPOINT_NOT_FOUND_ERR,
    };
    next(error);
});
// Global error handling middleware
app.use((err, req, res, next) => {
    console.log(err);
    const status = err.status || 500;
    const message = err.message || error_1.SERVER_ERR;
    const data = err.data || null;
    res.status(status).json({
        type: "error",
        message,
        data,
    });
});
// socket io
//chat
// const server = http.createServer(app);
const networkInterfaces = os_1.default.networkInterfaces();
// console.log("networkInterfaces", networkInterfaces);
const ipAddress = networkInterfaces["eth0"]
    ? networkInterfaces["eth0"][0].address
    : networkInterfaces["ens5"]
        ? networkInterfaces["ens5"][0].address
        : "local"; // Replace 'eth0' with your network interface name
let socketServer;
if (ipAddress == "local") {
    socketServer = http_1.default.createServer(app);
}
else {
    let privateKey, certificate;
    privateKey = fs_1.default.readFileSync("/home/ssl/ssl.key", "utf8");
    certificate = fs_1.default.readFileSync("/home/ssl/ssl.pem", "utf8");
    const credentials = { key: privateKey, cert: certificate };
    socketServer = https_1.default.createServer(credentials, app);
}
const io = new socket_io_1.Server(socketServer, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"],
    },
});
//initialising connection
io.on("connection", (socket) => {
    //when ceonnect
    console.log("a user connected.");
    console.log((0, socketUsers_1.getAllUsers)());
    //take userId and socketId from user
    socket.on("addUser", (userId) => {
        (0, socketUsers_1.addUser)(userId, socket.id);
        io.emit("getUsers", socketUsers_1.getAllUsers);
    });
    socket.on("join_room", (chatId) => {
        socket.join(chatId);
        console.log("room joined on", chatId);
        io.to(chatId).emit("JOIN_ROOM_RESPONSE", { success: true, chatId: chatId });
    });
    //send and get message
    socket.on("sendMessage", ({ chat, content, sender, _id }) => __awaiter(void 0, void 0, void 0, function* () {
        // const user = getUser(receiverId);
        const chatData = yield chat_model_1.default.findById((0, RequestHelper_1.ObjectId)(chat));
        if (chatData && (chatData === null || chatData === void 0 ? void 0 : chatData.admin)) {
            const adminUser = (0, socketUsers_1.getUser)(chatData === null || chatData === void 0 ? void 0 : chatData.admin);
        }
        console.log(chat, "chatId");
        socket.to(chat).emit("getMessage", {
            sender: sender,
            message: content,
            _id: _id,
        });
    }));
    //when disconnect
    socket.on("disconnect", () => {
        console.log("a user disconnected!");
        (0, socketUsers_1.removeUser)(socket.id);
        io.emit("getUsers", socketUsers_1.getAllUsers);
    });
});
socketServer.listen(constant_1.PORT || 4000, () => {
    console.log(`Server listening on port ${constant_1.PORT}`);
});
// server.listen(5000);
// chat --end
function connectDb() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            yield mongoose_1.default.connect(constant_1.MONGO_URI, {
                useNewUrlParser: true,
                useUnifiedTopology: true,
                autoIndex: true,
            });
            console.log(yield (0, rating_controller_1.getExpertRating)("6565c50341468cf6dc072a1f"), "rating");
            // await createConversation([ObjectId('6548886847ebf9db402d76de'), ObjectId("65291bd55362175c14d19466")], ObjectId('654b23aeeef44186bd7d39f6'))
            console.log("database connected");
        }
        catch (error) {
            console.log(error);
            process.exit(1);
        }
    });
}
connectDb();
