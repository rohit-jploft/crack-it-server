import express, { Request, Response, NextFunction } from "express";
import mongoose from "mongoose";
import cors from "cors";
import * as dotenv from "dotenv";
import { PORT, MONGO_URI, NODE_ENV } from "./utils/constant";
import { API_ENDPOINT_NOT_FOUND_ERR, SERVER_ERR } from "./utils/error";
import { ConnectionOptions } from "tls";
import bodyParser from "body-parser";
import router from "./routes/index";
import path from "path";
import { Server } from "socket.io";
import http from "http";
import https from "https";
import fs from "fs";
import os from "os";
//dot env
dotenv.config();

// Initiate express app
const app = express();

// Middleware

// online users
const onlineUsers = new Map();

app.use(
  cors({
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
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

let users:any = [];

  //add user to connected user
  const addUser = (userId:string, socketId:string) => {
    !users.some((user:any) => user.userId === userId) &&
      users.push({ userId, socketId});
  };

  //remove user from connected userList
  const removeUser = (socketId:string) => {
    users = users.filter((user:any) => user.socketId !== socketId);
  };

  //get user
  const getUser = (userId:string) => {
    const user = users.find((user:any) => user.userId === userId);
    return user;
  };

  //initialising connection
  io.on('connection', (socket) => {
    //when ceonnect
    console.log('a user connected.');
    console.log(users);
    //take userId and socketId from user
    socket.on('addUser', (userId) => {
      addUser(userId, socket.id);
      io.emit('getUsers', users);
    });

    //send and get message
    socket.on('sendMessage', ({ senderId, receiverId, text }) => {
      const user = getUser(receiverId);
      console.log({ senderId, receiverId, text });
      console.log(user)
      io.to(user.socketId).emit('getMessage', {
        senderId,
        text,
      });
    });

    //when disconnect
    socket.on('disconnect', () => {
      console.log('a user disconnected!');
      removeUser(socket.id);
      io.emit('getUsers', users);
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
