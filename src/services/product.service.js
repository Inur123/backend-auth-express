const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

async function list(userId) {
  return prisma.product.findMany({
    where: { userId: Number(userId) },
    orderBy: { id: "desc" },
  });
}

async function detail(userId, id) {
  const product = await prisma.product.findFirst({
    where: { id: Number(id), userId: Number(userId) },
  });

  if (!product) throw new AppError("Product tidak ditemukan", 404);
  return product;
}

async function create(userId, data) {
  return prisma.product.create({
    data: {
      name: data.name,
      price: data.price,
      description: data.description ?? null,
      userId: Number(userId),
    },
  });
}

async function update(userId, id, data) {
  // ✅ pastikan product milik user
  const exists = await prisma.product.findFirst({
    where: { id: Number(id), userId: Number(userId) },
    select: { id: true },
  });
  if (!exists) throw new AppError("Product tidak ditemukan", 404);

  return prisma.product.update({
    where: { id: Number(id) },
    data: {
      name: data.name ?? undefined,
      price: data.price ?? undefined,
      // ✅ jangan paksa null kalau FE tidak kirim
      description: data.description === undefined ? undefined : data.description,
    },
  });
}

async function remove(userId, id) {
  const exists = await prisma.product.findFirst({
    where: { id: Number(id), userId: Number(userId) },
    select: { id: true },
  });
  if (!exists) throw new AppError("Product tidak ditemukan", 404);

  await prisma.product.delete({
    where: { id: Number(id) },
  });
}

module.exports = { list, detail, create, update, remove };
