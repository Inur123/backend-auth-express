const asyncHandler = require("../utils/asyncHandler");
const AppError = require("../utils/AppError");
const { registerSchema, loginSchema } = require("../validators/auth.schema");
const authService = require("../services/auth.service");
const { blacklistToken } = require("../utils/tokenBlacklist");

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
  const userId = req.auth.userId;
  const user = await authService.me(userId);

  res.json({
    message: "OK",
    data: { user },
  });
});

exports.logout = (req, res) => {
  const token = req.token;

  blacklistToken(token);

  res.json({
    message: "Logout berhasil. Token sudah tidak bisa digunakan.",
  });
};