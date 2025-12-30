const { z } = require("zod");

const createProductSchema = z.object({
  name: z.string().min(2, "name minimal 2 karakter"),
  price: z.number().int().nonnegative("price harus >= 0"),
  description: z.string().optional(),
});

const updateProductSchema = z.object({
  name: z.string().min(2).optional(),
  price: z.number().int().nonnegative().optional(),
  description: z.string().optional(),
}).refine((data) => data.name !== undefined || data.price !== undefined || data.description !== undefined, {
  message: "Minimal salah satu field harus diisi",
});

module.exports = { createProductSchema, updateProductSchema };
