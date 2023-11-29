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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getChatFromMeetingId = exports.enterChatForAdmin = exports.searchConversations = exports.getConvoMessage = exports.sendMessage = exports.getUsersConversation = exports.createConvoApi = exports.createConversation = void 0;
const chat_model_1 = __importDefault(require("../../models/chat.model"));
const RequestHelper_1 = require("../../helper/RequestHelper");
const chat_schema_1 = require("../../schemas/chat.schema");
const message_model_1 = __importDefault(require("../../models/message.model"));
const booking_model_1 = __importDefault(require("../../models/booking.model"));
const Notification_controller_1 = require("../Notifications/Notification.controller");
const NotificationType_1 = require("../../utils/NotificationType");
const notificationMessageConstant_1 = require("../../utils/notificationMessageConstant");
const createConversation = (users, bookingId, agency) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const check = yield chat_model_1.default.findOne({ booking: bookingId });
        if (!check) {
            const createChat = yield chat_model_1.default.create({
                participants: users,
                admin: null,
                booking: bookingId,
                agency
            });
            return { chat: createChat, isNew: true };
        }
        else {
            return { chat: check, isNew: true };
        }
    }
    catch (error) {
        return error.message;
    }
});
exports.createConversation = createConversation;
const createConvoApi = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meetingId } = req.params;
    try {
        const chat = yield chat_model_1.default.findOne({ booking: meetingId });
        if (chat) {
            return res.status(200).json({
                success: true,
                status: 200,
                data: chat,
                message: "chat with this meetingId is already created",
            });
        }
        else {
            const meeting = yield booking_model_1.default.findById(meetingId);
            if (meeting) {
                let users = [];
                users.push(meeting.user);
                users.push(meeting.expert);
                const convo = yield (0, exports.createConversation)(users, meeting._id);
                if (convo) {
                    return res.status(200).json({
                        success: true,
                        status: 200,
                        data: convo,
                        message: "Conversation Created successfully",
                    });
                }
            }
        }
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.createConvoApi = createConvoApi;
const getUsersConversation = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId } = req.params;
    try {
        const chatConvo = yield chat_model_1.default.find({
            $or: [
                { participants: { $in: [userId] } },
                { admin: userId },
                { superAdmin: userId },
                { agency: userId },
            ],
            isClosed: false,
        })
            .populate("participants", "firstName lastName role profilePhoto")
            .populate("admin", "firstName lastName role")
            .populate("superAdmin", "firstName lastName role")
            .populate("agency", "agencyName role");
        const finalList = yield Promise.all(chatConvo.map((chat) => __awaiter(void 0, void 0, void 0, function* () {
            // const rating = await getExpertRating(expert.user._id.toString());
            const msg = yield message_model_1.default.findOne({ chat: chat._id }, null, { sort: { createdAt: -1 } }).select("content type createdAt");
            console.log(msg);
            return Object.assign(Object.assign({}, chat._doc), { latestMessage: msg });
        })));
        return res.status(200).json({
            success: true,
            status: 200,
            data: finalList,
            message: "Users chat conversation fetched",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getUsersConversation = getUsersConversation;
const sendMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const data = req.body;
    const { error, value } = chat_schema_1.messageJoiSchema.validate(data);
    if (req === null || req === void 0 ? void 0 : req.files) {
        var { audio } = req === null || req === void 0 ? void 0 : req.files;
        if (audio) {
            var media = ((_b = (_a = audio[0]) === null || _a === void 0 ? void 0 : _a.path) === null || _b === void 0 ? void 0 : _b.replaceAll("\\", "/")) || "";
        }
    }
    if (error) {
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
    try {
        const message = yield message_model_1.default.create({
            chat: (0, RequestHelper_1.ObjectId)(value.chat),
            sender: (0, RequestHelper_1.ObjectId)(value.sender),
            type: audio ? value.type : "text",
            content: value.content,
            media: audio ? media : "",
        });
        const chatObj = yield chat_model_1.default.findById((0, RequestHelper_1.ObjectId)(value.chat));
        if (chatObj && chatObj.participants) {
            for (let cha of chatObj === null || chatObj === void 0 ? void 0 : chatObj.participants) {
                if (value.sender !== cha.toString()) {
                    yield (0, Notification_controller_1.createNotification)((0, RequestHelper_1.ObjectId)(value.sender), (0, RequestHelper_1.ObjectId)(cha.toString()), notificationMessageConstant_1.NoticationMessage.newMessage.title, NotificationType_1.NotificationType.Chat, "web", notificationMessageConstant_1.NoticationMessage.newMessage.message, { targetId: value.chat });
                }
            }
        }
        return res.status(200).json({
            success: true,
            status: 200,
            data: message,
            message: "message sent successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.sendMessage = sendMessage;
const getConvoMessage = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { convoId } = req.params;
    try {
        const convo = yield message_model_1.default.find({
            chat: (0, RequestHelper_1.ObjectId)(convoId),
        }).populate("sender", "_id firstName lastName profilePhoto");
        return res.status(200).json({
            success: true,
            status: 200,
            data: convo,
            message: "message fetched successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getConvoMessage = getConvoMessage;
const searchConversations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { search, userId } = req.query;
    try {
        // Use aggregation to search for chats with matching participants or admin/superAdmin
        const chats = yield chat_model_1.default.aggregate([
            {
                $match: {
                    $or: [
                        { participants: userId },
                        { admin: userId },
                        { superAdmin: userId },
                    ],
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "participants",
                    foreignField: "_id",
                    as: "participants",
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            // {
            //   $unwind: {
            //     path: "$participantsDetails",
            //     preserveNullAndEmptyArrays: true,
            //   },
            // },
            {
                $lookup: {
                    from: "users",
                    localField: "admin",
                    foreignField: "_id",
                    as: "adminDetails",
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            {
                $unwind: {
                    path: "$adminDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "superAdmin",
                    foreignField: "_id",
                    as: "superAdminDetails",
                    pipeline: [{ $project: { firstName: 1, lastName: 1 } }],
                },
            },
            {
                $unwind: {
                    path: "$superAdminDetails",
                    preserveNullAndEmptyArrays: true,
                },
            },
            // {
            //   $match: {
            //     $or: [
            //       {
            //         "participantsDetails.firstName": {
            //           $regex: search,
            //           $options: "i",
            //         },
            //       },
            //       {
            //         "participantsDetails.lastName": { $regex: search, $options: "i" },
            //       },
            //       {
            //         "adminDetails.firstName": { $regex: search, $options: "i" },
            //       },
            //       {
            //         "adminDetails.lastName": { $regex: search, $options: "i" },
            //       },
            //       {
            //         "superAdminDetails.firstName": { $regex: search, $options: "i" },
            //       },
            //       {
            //         "superAdminDetails.lastName": { $regex: search, $options: "i" },
            //       },
            //     ],
            //   },
            // },
        ]);
        return res.status(200).json({
            success: true,
            status: 200,
            data: chats,
            message: "chats fetched successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.searchConversations = searchConversations;
const enterChatForAdmin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meetingId } = req.query;
    const role = res.locals.user.role;
    console.log(role, "role");
    try {
        const chat = yield chat_model_1.default.findOne({ booking: meetingId });
        console.log(chat);
        if (!chat) {
            return res.status(200).json({
                status: 200,
                success: false,
                message: "Chat not created yet",
            });
        }
        if (chat && (chat === null || chat === void 0 ? void 0 : chat.admin) && role === "ADMIN") {
            return res.status(200).json({
                success: false,
                status: 200,
                message: "Admin already entered into chat",
            });
        }
        if (role == "ADMIN" && !chat.admin) {
            chat["admin"] = res.locals.user._id;
        }
        if (chat && (chat === null || chat === void 0 ? void 0 : chat.agency) && role === "AGENCY") {
            return res.status(200).json({
                success: false,
                status: 200,
                data: {
                    chat: chat === null || chat === void 0 ? void 0 : chat._id,
                },
                message: "Agency already entered into chat",
            });
        }
        if (role == "AGENCY" && !chat.agency) {
            chat["agency"] = res.locals.user._id;
        }
        if (chat && (chat === null || chat === void 0 ? void 0 : chat.superAdmin) && role === "SUPER_ADMIN") {
            return res.status(200).json({
                success: false,
                status: 200,
                data: {
                    chat: chat === null || chat === void 0 ? void 0 : chat._id,
                },
                message: "Super Admin already entered into chat",
            });
        }
        if (role == "SUPER_ADMIN") {
            console.log("yes super admin");
            console.log(res.locals.user._id);
            chat.superAdmin = res.locals.user._id;
        }
        yield chat.save();
        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                chat: chat === null || chat === void 0 ? void 0 : chat._id,
            },
            message: role + " entered into chat successFully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.enterChatForAdmin = enterChatForAdmin;
const getChatFromMeetingId = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { meetingId } = req.params;
    try {
        const chatWindow = yield chat_model_1.default.findOne({
            booking: (0, RequestHelper_1.ObjectId)(meetingId),
        });
        if (!chatWindow) {
            return res.status(208).json({
                success: false,
                status: 200,
                message: "Chat not initiated yet",
            });
        }
        return res.status(200).json({
            success: true,
            status: 200,
            data: {
                chat: chatWindow._id,
            },
            message: "Chat details fetched successfully",
        });
    }
    catch (error) {
        // Return error if anything goes wrong
        return res.status(403).json({
            success: false,
            status: 403,
            message: error.message,
        });
    }
});
exports.getChatFromMeetingId = getChatFromMeetingId;
