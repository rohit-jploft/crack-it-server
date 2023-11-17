import multer from "multer";
import path from "path";
import fs from "fs";
import { Request, Response, NextFunction } from "express";

// Define the maximum size for uploading
// picture i.e. 50 MB. it is optional
const maxSize = 50 * 1024 * 1024;

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    // Uploads is the Upload_folder_name
    const splitUrl = req.baseUrl.split("/");
    console.log(splitUrl[splitUrl.length - 1]);
    const dir = "uploads/" + splitUrl[splitUrl.length - 1];
    console.log(dir);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  // Generate filename
  filename: function (req, file, cb) {
    let fileType = file.originalname.split(".")[1];
    if (fileType.includes("+")) {
      fileType = fileType.split("+")[0];
    }
    if(fileType === "m4a"){
      cb(null, file.fieldname + "-" + Date.now() + "." + 'mp3');
    }
    cb(null, file.fieldname + "-" + Date.now() + "." + fileType);
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: maxSize },
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check File Type
function checkFileType(
  file: Express.Multer.File,
  cb: multer.FileFilterCallback
) {
  // Allowed ext
  const filetypes =
    /doc|docx|pdf|ppt|pptx|xls|xlsx|mp4|mov|jpeg|jpg|png|gif|svg|csv|swf|mp3|AVI|WMV|flv|ogg|webm|webp|m4a|wav/;
  // Check ext
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

  if (extname) {
    return cb(null, true);
  } else {
    cb(new Error("Error: Images & Videos Only!"));
  }
}

export default upload;
