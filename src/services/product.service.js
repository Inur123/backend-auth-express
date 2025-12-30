const { PrismaClient } = require("@prisma/client");
const AppError = require("../utils/AppError");

const prisma = new PrismaClient();

async function list() {
  return prisma.product.findMany({
    orderBy: { id: "desc" },
  });
}

async function detail(id) {
  const product = await prisma.product.findUnique({
    where: { id: Number(id) },
  });
  if (!product) throw new AppError("Product tidak ditemukan", 404);
  return product;
}

async function create(data) {
  return prisma.product.create({ data });
}

async function update(id, data) {
  try {
    return await prisma.product.update({
      where: { id: Number(id) },
      data,
    });
  } catch (err) {
    // Prisma "record not found"
    if (err.code === "P2025") throw new AppError("Product tidak ditemukan", 404);
    throw err;
  }
}

async function remove(id) {
  try {
    await prisma.product.delete({ where: { id: Number(id) } });
    return { ok: true };
  } catch (err) {
    if (err.code === "P2025") throw new AppError("Product tidak ditemukan", 404);
    throw err;
  }
}

module.exports = { list, detail, create, update, remove };
