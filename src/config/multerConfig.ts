import multer, { StorageEngine } from "multer";
import fs from "fs";
import path from "path";
import { Request } from "express";

export interface UploadRequest extends Request {
  uploadDir?: string;
}

const storage: StorageEngine = multer.diskStorage({
  destination: (req, _file, cb) => {
    const baseDir = path.join(process.cwd(), "uploads");
    const uploadDir = path.join(baseDir, Date.now().toString());
    fs.mkdirSync(uploadDir, { recursive: true });

    (req as UploadRequest).uploadDir = uploadDir;

    cb(null, uploadDir);
  },
  filename: (_req, file, cb) => {
    cb(null, file.originalname);
  },
});

export const upload = multer({ storage });
