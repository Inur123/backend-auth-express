const asyncHandler = require("../utils/asyncHandler");
const productService = require("../services/product.service");
const { createProductSchema, updateProductSchema } = require("../validators/product.schema");
const { broadcast } = require("../utils/sse");

exports.list = asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const products = await productService.list(userId);
  res.json({ message: "OK", data: { products } });
});

exports.detail = asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const { id } = req.params;
  const product = await productService.detail(userId, id);
  res.json({ message: "OK", data: { product } });
});

exports.create = asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);

  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const product = await productService.create(userId, result.data);

  // ✅ realtime notify + kirim userId supaya FE bisa filter
  broadcast("products_changed", { action: "create", id: product.id, userId });

  res.status(201).json({ message: "Product dibuat", data: { product } });
});

exports.update = asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const { id } = req.params;

  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    const flat = result.error.flatten();
    return res.status(422).json({
      message: "Validation error",
      errors: { ...flat.fieldErrors, _form: flat.formErrors },
    });
  }

  const product = await productService.update(userId, id, result.data);

  broadcast("products_changed", { action: "update", id: product.id, userId });

  res.json({ message: "Product diupdate", data: { product } });
});

exports.remove = asyncHandler(async (req, res) => {
  const userId = Number(req.auth.userId);
  const { id } = req.params;

  await productService.remove(userId, id);

  broadcast("products_changed", { action: "delete", id: Number(id), userId });

  res.json({ message: "Product dihapus" });
});
