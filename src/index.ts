import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import schedule from 'node-schedule';
import * as dotenv from "dotenv";
import { PORT, MONGO_URI, NODE_ENV } from "./utils/constant";
import { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } from "./utils/error";
import {
  addUser,
  removeUser,
  getUser,
  getAllUsers,
} from "./helper/socketUsers";
import { ConnectionOptions } from "tls";
import bodyParser from "body-parser";
import router from "./routes/index";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import os from "os";
import Chat from "./models/chat.model";
import { ObjectId } from "./helper/RequestHelper";
import { createTransaction, createWallet } from "./controllers/Wallet/wallet.controller";
import { makeStatusFromConfirmedToCompleted, startChatForConfirmedBookingBefore15Min } from "./scheduler/bookingScheduler";
//dot env
dotenv.config();

// Initiate express app
const app = express();

// Middleware

// online users
const onlineUsers = new Map();

app.use(
  cors({
    origin: "*",
    methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
    preflightContinue: false,
    optionsSuccessStatus: 204,
  })
);

if (NODE_ENV === "development") {
  const morgan = require("morgan");
  app.use(morgan("dev"));
}

// Apply middlewares
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use(
  bodyParser.json({ limit: "1024mb" }),
  bodyParser.urlencoded({
    limit: "1024mb",
    extended: true,
  }),
  cors()
  // morgan('dev')
);

// Serve static files
const staticPath = path.join(__dirname, "..", "uploads"); // Define the path to your static files
app.use("/uploads", express.static(staticPath));

// Welcome route
app.get("/", (req: Request, res: Response) => {
  res.status(200).json({
    type: "SUCCESS",
    message: "SERVER IS UP AND RUNNING",
    data: null,
  });
});

// Routes
app.use("/", router);


schedule.scheduleJob("* * * * *", makeStatusFromConfirmedToCompleted)
// schedule.scheduleJob("* * * * *", startChatForConfirmedBookingBefore15Min)


app.use("*", (req: Request, res: Response, next: NextFunction) => {
  const error = {
    status: 404,
    message: API_ENDPOINT_NOT_FOUND_ERR,
  };
  next(error);
});

// Global error handling middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  const status = err.status || 500;
  const message = err.message || SERVER_ERR;
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

const networkInterfaces = os.networkInterfaces();
// console.log("networkInterfaces", networkInterfaces);
const ipAddress = networkInterfaces["eth0"]
  ? networkInterfaces["eth0"][0].address
  : networkInterfaces["ens5"]
  ? networkInterfaces["ens5"][0].address
  : "local"; // Replace 'eth0' with your network interface name
let socketServer;
if (ipAddress == "local") {
  socketServer = http.createServer(app);
} else {
  let privateKey, certificate;
  privateKey = fs.readFileSync("/home/ssl/ssl.key", "utf8");
  certificate = fs.readFileSync("/home/ssl/ssl.pem", "utf8");
  const credentials = { key: privateKey, cert: certificate };
  socketServer = https.createServer(credentials, app);
}

const io = new Server(socketServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

//initialising connection
io.on("connection", (socket) => {
  //when ceonnect
  console.log("a user connected.");
  console.log(getAllUsers());
  //take userId and socketId from user
  socket.on("addUser", (userId) => {
    addUser(userId, socket.id);

    io.emit("getUsers", getAllUsers);
  });
  socket.on("join_room", (chatId) => {
    socket.join(chatId);
    console.log("room joined on", chatId);
  });

  //send and get message
  socket.on("sendMessage", async ({ chat, content, sender, _id }) => {
    // const user = getUser(receiverId);
    const chatData: any = await Chat.findById(ObjectId(chat));
    if (chatData && chatData?.admin) {
      const adminUser = getUser(chatData?.admin);
    }
    console.log(chat, "chatId");
    socket.to(chat).emit("getMessage", {
      sender: sender,
      message: content,
      _id: _id,
    });
  });

  //when disconnect
  socket.on("disconnect", () => {
    console.log("a user disconnected!");
    removeUser(socket.id);
    io.emit("getUsers", getAllUsers);
  });
});

socketServer.listen(PORT || 4000, () => {
  console.log(`Server listening on port ${PORT}`);
});

// server.listen(5000);

// chat --end

async function connectDb() {
  try {
    await mongoose.connect(MONGO_URI, <ConnectionOptions>{
      useNewUrlParser: true,
      useUnifiedTopology: true,
      autoIndex: true,
    });
    // app.listen(PORT || 4000, () => {
    //   console.log(`Server listening on port ${PORT}`);
    // });
   
    console.log("database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDb();
