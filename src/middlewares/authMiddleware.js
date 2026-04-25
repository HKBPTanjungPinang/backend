const { extractToken, verifyToken } = require("../utils/auth");

function createError(message, statusCode = 500) {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
}

function authMiddleware(req, res, next) {
  const token = extractToken(req.headers.authorization);
  
  if (!token) {
    return res.status(401).json({
      message: "Token tidak ditemukan. Silakan login terlebih dahulu.",
    });
  }

  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({
      message: "Token tidak valid atau sudah expired.",
    });
  }

  req.user = decoded;
  next();
}

function superadminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "Superadmin") {
    return res.status(403).json({
      message: "Akses hanya untuk Superadmin",
    });
  }

  next();
}

function adminGerejasMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "AdminGereja") {
    return res.status(403).json({
      message: "Akses hanya untuk Admin Gereja",
    });
  }

  next();
}

function adminOrSuperadminMiddleware(req, res, next) {
  if (!req.user) {
    return res.status(401).json({
      message: "Unauthorized",
    });
  }

  if (req.user.role !== "AdminGereja" && req.user.role !== "Superadmin") {
    return res.status(403).json({
      message: "Akses hanya untuk Admin atau Superadmin",
    });
  }

  next();
}

module.exports = {
  createError,
  authMiddleware,
  superadminMiddleware,
  adminGerejasMiddleware,
  adminOrSuperadminMiddleware,
};
