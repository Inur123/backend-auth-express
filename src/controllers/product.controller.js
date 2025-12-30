const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const productService = require("../services/product.service");
const { createProductSchema, updateProductSchema } = require("../validators/product.schema");

exports.list = asyncHandler(async (req, res) => {
  const products = await productService.list();
  res.json({ message: "OK", data: { products } });
});

exports.detail = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const product = await productService.detail(id);
  res.json({ message: "OK", data: { product } });
});

exports.create = asyncHandler(async (req, res) => {
  const result = createProductSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const product = await productService.create(result.data);
  res.status(201).json({ message: "Product dibuat", data: { product } });
});

exports.update = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const result = updateProductSchema.safeParse(req.body);
  if (!result.success) {
    // refine error kadang masuk di formErrors
    const flat = result.error.flatten();
    return res.status(422).json({
      message: "Validation error",
      errors: { ...flat.fieldErrors, _form: flat.formErrors },
    });
  }

  const product = await productService.update(id, result.data);
  res.json({ message: "Product diupdate", data: { product } });
});

exports.remove = asyncHandler(async (req, res) => {
  const { id } = req.params;
  await productService.remove(id);
  res.json({ message: "Product dihapus" });
});
