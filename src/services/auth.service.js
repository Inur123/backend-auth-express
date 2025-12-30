const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

function signToken(user) {
  return jwt.sign(
    { tokenVersion: user.tokenVersion },
    process.env.JWT_SECRET,
    {
      subject: String(user.id),
      expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    }
  );
}

async function register({ name, email, password }) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new AppError("Email sudah terdaftar", 409);

  const passwordHash = await bcrypt.hash(password, 10);

  // select tokenVersion juga biar bisa sign token
  const user = await prisma.user.create({
    data: { name, email, passwordHash },
    select: { id: true, name: true, email: true, tokenVersion: true, createdAt: true },
  });

  const token = signToken(user);

  // jangan kirim tokenVersion ke client
  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
  return { user: safeUser, token };
}

async function login({ email, password }) {
  const user = await prisma.user.findUnique({
    where: { email },
    select: { id: true, name: true, email: true, passwordHash: true, tokenVersion: true, createdAt: true },
  });

  if (!user) throw new AppError("Email/password salah", 401);

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new AppError("Email/password salah", 401);

  const token = signToken(user);

  const safeUser = { id: user.id, name: user.name, email: user.email, createdAt: user.createdAt };
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

async function updateProfile(userId, data) {
  try {
    return await prisma.user.update({
      where: { id: Number(userId) },
      data,
      select: { id: true, name: true, email: true, createdAt: true },
    });
  } catch (err) {
    if (err.code === "P2002") {
      throw new AppError("Email sudah digunakan", 409);
    }
    throw err;
  }
}

// ✅ Logout = matiin semua token lama dengan tokenVersion++
async function logout(userId) {
  await prisma.user.update({
    where: { id: Number(userId) },
    data: { tokenVersion: { increment: 1 } },
  });
}

module.exports = { register, login, me, updateProfile, logout };
