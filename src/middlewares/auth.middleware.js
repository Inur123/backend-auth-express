const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");
const { isTokenBlacklisted } = require("../utils/tokenBlacklist");

module.exports = function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized: token tidak ada", 401));
  }

  const token = header.replace("Bearer ", "").trim();

  // ✅ CEK BLACKLIST
  if (isTokenBlacklisted(token)) {
    return next(new AppError("Unauthorized: token sudah logout", 401));
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.auth = { userId: payload.sub };
    req.token = token; // simpan token untuk logout
    return next();
  } catch (e) {
    return next(new AppError("Unauthorized: token tidak valid", 401));
  }
};
