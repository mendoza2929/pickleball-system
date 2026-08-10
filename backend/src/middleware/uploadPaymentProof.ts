import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDirectory = path.join(
  process.cwd(),
  "uploads",
  "payment-proofs"
);

// =====================================================
// ENSURE UPLOAD DIRECTORY EXISTS
// =====================================================

if (!fs.existsSync(uploadDirectory)) {
  fs.mkdirSync(uploadDirectory, {
    recursive: true,
  });
}

// =====================================================
// STORAGE
// =====================================================

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, uploadDirectory);
  },

  filename: (_req, file, cb) => {
    const extension = path.extname(
      file.originalname
    );

    const filename =
      `payment-${Date.now()}-${Math.round(
        Math.random() * 1e9
      )}${extension}`;

    cb(null, filename);
  },
});

// =====================================================
// FILE FILTER
// =====================================================

const fileFilter: multer.Options["fileFilter"] = (
  _req,
  file,
  cb
) => {
  const allowedTypes = [
    "image/png",
    "image/jpeg",
    "image/jpg",
  ];

  if (!allowedTypes.includes(file.mimetype)) {
    cb(
      new Error(
        "Only PNG, JPG, and JPEG images are allowed."
      )
    );

    return;
  }

  cb(null, true);
};

// =====================================================
// UPLOAD MIDDLEWARE
// =====================================================

export const uploadPaymentProof = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,
  },
});