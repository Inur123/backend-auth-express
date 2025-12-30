const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { registerSchema, loginSchema } = require("../validators/auth.schema");
const { updateProfileSchema } = require("../validators/profile.schema");
const authService = require("../services/auth.service");

function validate(schema, body) {
  const result = schema.safeParse(body);
  if (!result.success) {
    const errors = result.error.flatten();
    throw new AppError(JSON.stringify(errors.fieldErrors), 422);
  }
  return result.data;
}

exports.register = asyncHandler(async (req, res) => {
  const data = validate(registerSchema, req.body);
  const { user, token } = await authService.register(data);

  res.status(201).json({
    message: "Register berhasil",
    data: { user, token },
  });
});

exports.login = asyncHandler(async (req, res) => {
  const data = validate(loginSchema, req.body);
  const { user, token } = await authService.login(data);

  res.json({
    message: "Login berhasil",
    data: { user, token },
  });
});

exports.me = asyncHandler(async (req, res) => {
  const user = await authService.me(req.auth.userId);

  res.json({
    message: "OK",
    data: { user },
  });
});

exports.updateProfile = asyncHandler(async (req, res) => {
  const result = updateProfileSchema.safeParse(req.body);
  if (!result.success) {
    return res.status(422).json({
      message: "Validation error",
      errors: result.error.flatten().fieldErrors,
    });
  }

  const user = await authService.updateProfile(req.auth.userId, result.data);

  res.json({
    message: "Profile berhasil diupdate",
    data: { user },
  });
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.auth.userId);

  res.json({
    message: "Logout berhasil. Semua token lama tidak berlaku.",
  });
});
