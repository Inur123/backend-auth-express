const { z } = require("zod");

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  email: z.string().email().optional(),
}).refine(
  (data) => data.name || data.email,
  { message: "Minimal salah satu field harus diisi" }
);

module.exports = { updateProfileSchema };
