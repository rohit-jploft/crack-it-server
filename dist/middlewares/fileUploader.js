"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
// Define the maximum size for uploading
// picture i.e. 50 MB. it is optional
const maxSize = 50 * 1024 * 1024;
const storage = multer_1.default.diskStorage({
    destination: function (req, file, cb) {
        // Uploads is the Upload_folder_name
        const splitUrl = req.baseUrl.split("/");
        console.log(splitUrl[splitUrl.length - 1]);
        const dir = "uploads/" + splitUrl[splitUrl.length - 1];
        console.log(dir);
        if (!fs_1.default.existsSync(dir)) {
            fs_1.default.mkdirSync(dir, { recursive: true });
        }
        cb(null, dir);
    },
    // Generate filename
    filename: function (req, file, cb) {
        let fileType = file.originalname.split(".")[1];
        if (fileType.includes("+")) {
            fileType = fileType.split("+")[0];
        }
        if (fileType === "m4a") {
            cb(null, file.fieldname + "-" + Date.now() + "." + 'mp3');
        }
        cb(null, file.fieldname + "-" + Date.now() + "." + fileType);
    },
});
const upload = (0, multer_1.default)({
    storage: storage,
    limits: { fileSize: maxSize },
    fileFilter: function (req, file, cb) {
        checkFileType(file, cb);
    },
});
// Check File Type
function checkFileType(file, cb) {
    // Allowed ext
    const filetypes = /doc|docx|pdf|ppt|pptx|xls|xlsx|mp4|mov|jpeg|jpg|png|gif|svg|csv|swf|mp3|AVI|WMV|flv|ogg|webm|webp|m4a|wav/;
    // Check ext
    const extname = filetypes.test(path_1.default.extname(file.originalname).toLowerCase());
    if (extname) {
        return cb(null, true);
    }
    else {
        cb(new Error("Error: Images & Videos Only!"));
    }
}
exports.default = upload;
