const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

function signToken(userId) {
  return jwt.sign(
    {},
    process.env.JWT_SECRET,
    {
      subject: String(userId),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

async function register({ name, email, password }) {
  // cek email
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email sudah terdaftar", 409);

  const passwordHash = await bcrypt.hash(password, 10);

  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  const token = signToken(user.id);

  return { user, token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) throw new AppError("Email/password salah", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Email/password salah", 401);

  const token = signToken(user.id);

  const safeUser = {
    id: user.id,
    name: user.name,
    email: user.email,
    createdAt: user.createdAt,
  };

  return { user: safeUser, token };
}

async function me(userId) {
  const user = await prisma.user.findUnique({
    where: { id: Number(userId) },
    select: { id: true, name: true, email: true, createdAt: true },
  });

  if (!user) throw new AppError("User tidak ditemukan", 404);
  return user;
}

module.exports = { register, login, me };
