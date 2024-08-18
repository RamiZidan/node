const multer = require("multer");

const imageStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/storage/images");
  },
  filename: (req, file, cb) => {
    let uniqueID = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueID + "-" + file.originalname);
  },
});

const documentStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "public/storage/documents");
  },
  filename: (req, file, cb) => {
    let uniqueID = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueID + "-" + file.originalname);
  },
});

const imageFilter = (req, file, cb) => {
  let allowedMimeTypes = new Set([
    // type/subType
    "image/jpeg",
    "image/jpg",
    "image/png",
    "image/webp",
    "image/gif",
    "image/bmp",
    "image/tiff",
    "image/svg+xml",
    "image/x-icon",
  ]);
  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Allowed types are JPEG, JPG, PNG, WebP, GIF, BMP, TIFF, SVG, and ICO."
      ),
      false
    );
  }
};

const documentFilter = (req, file, cb) => {
  const allowedMimeTypes = new Set([
    // type/subType
    "application/pdf",
    "application/csr",
    "application/key",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-powerpoint",
    "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    "application/vnd.oasis.opendocument.text",
    "text/plain",
    "text/csv",
  ]);

  if (allowedMimeTypes.has(file.mimetype)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        "Unsupported file type. Allowed types are PDF, DOC, DOCX, XLS, XLSX, PPT, PPTX, TXT, ODT, and CSV."
      ),
      false
    );
  }
};

const uploadImage = multer({ storage: imageStorage, fileFilter: imageFilter });
const uploadDocument = multer({
  storage: documentStorage,
  fileFilter: documentFilter,
});

module.exports = { uploadImage, uploadDocument };
