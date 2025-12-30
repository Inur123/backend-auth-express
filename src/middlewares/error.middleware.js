const AppError = require("../utils/AppError");

module.exports = function errorMiddleware(err, req, res, next) {
  // Prisma error: unique constraint
  if (err && err.code === "P2002") {
    return res.status(409).json({ message: "Email sudah terdaftar" });
  }

  if (err instanceof AppError) {
    return res.status(err.statusCode).json({ message: err.message });
  }

  console.error(err);
  return res.status(500).json({ message: "Internal Server Error" });
};
