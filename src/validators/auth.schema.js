const { z } = require("zod");

const registerSchema = z.object({
  name: z.string().min(2, "name minimal 2 karakter"),
  email: z.string().email("email tidak valid"),
  password: z.string().min(6, "password minimal 6 karakter"),
});

const loginSchema = z.object({
  email: z.string().email("email tidak valid"),
  password: z.string().min(1, "password wajib diisi"),
});

module.exports = { registerSchema, loginSchema };
