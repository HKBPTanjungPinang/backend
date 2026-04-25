const fs = require("fs");
const path = require("path");
const multer = require("multer");
const { createError } = require("../controllers/resourceController");

function createPdfUploadMiddleware(folderName) {
  const uploadDirectory = path.join(process.cwd(), "uploads", folderName);
  fs.mkdirSync(uploadDirectory, { recursive: true });

  const storage = multer.diskStorage({
    destination(_req, _file, cb) {
      cb(null, uploadDirectory);
    },
    filename(_req, file, cb) {
      const safeName = file.originalname.replace(/\s+/g, "-");
      cb(null, `${Date.now()}-${safeName}`);
    },
  });

  function fileFilter(_req, file, cb) {
    const isPdfMime = file.mimetype === "application/pdf";
    const isPdfName = path.extname(file.originalname).toLowerCase() === ".pdf";

    if (!isPdfMime && !isPdfName) {
      cb(createError("File yang diupload harus PDF", 400));
      return;
    }

    cb(null, true);
  }

  return multer({
    storage,
    fileFilter,
    limits: {
      fileSize: 10 * 1024 * 1024,
    },
  });
}

module.exports = createPdfUploadMiddleware;
