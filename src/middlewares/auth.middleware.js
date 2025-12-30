const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

module.exports = async function authMiddleware(req, res, next) {
  const header = req.headers.authorization;

  if (!header || !header.startsWith("Bearer ")) {
    return next(new AppError("Unauthorized: token tidak ada", 401));
  }

  const token = header.replace("Bearer ", "").trim();

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: Number(payload.sub) },
      select: { id: true, tokenVersion: true },
    });

    if (!user) return next(new AppError("Unauthorized", 401));

    // ✅ kunci invalidate token lama setelah logout (tokenVersion naik)
    if (payload.tokenVersion !== user.tokenVersion) {
      return next(new AppError("Unauthorized: token sudah tidak berlaku", 401));
    }

    req.auth = { userId: user.id };
    return next();
  } catch (e) {
    return next(new AppError("Unauthorized: token tidak valid/expired", 401));
  }
};
