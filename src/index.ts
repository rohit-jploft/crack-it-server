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
//dot env
dotenv.config();

// Initiate express app
const app = express();

// Middleware

// online users
const onlineUsers = new Map();

app.use(
  cors({
    credentials: true,
    origin: `http://localhost:${PORT}`,
    optionsSuccessStatus: 200,
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
var httpServer = app.listen(PORT || 4000, () =>
  console.log(`Server listening on port ${PORT}`)
);
const io = new Server(httpServer, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log(`socket connection with socketId:${socket.id}`);

  socket.on('join', (username) => {
    // Add the user to the onlineUsers Map with their socket ID
    onlineUsers.set(socket.id, { username });
    // Notify all clients that a user has joined
    io.emit('user joined', username);
  });

  socket.on('chat message', (msg) => {
    // Handle chat messages here
    io.emit('chat message', { username: onlineUsers.get(socket.id).username, message: msg });
  });

  socket.on('disconnect', () => {
    const username = onlineUsers.get(socket.id)?.username;
    onlineUsers.delete(socket.id); // Remove the user when they disconnect
    if (username) {
      // Notify all clients that a user has left
      io.emit('user left', username);
    }
    console.log('A user disconnected');
  });
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

    console.log("database connected");
  } catch (error) {
    console.log(error);
    process.exit(1);
  }
}

connectDb();
