const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");

const routes = require("./routes");
const errorMiddleware = require("./middlewares/error.middleware");
const apiKeyMiddleware = require("./middlewares/apiKey.middleware");

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());

app.use(rateLimit({ windowMs: 60_000, max: 120 }));

app.get("/health", (req, res) => res.json({ ok: true }));

// ✅ PROTECT API ROUTES
app.use("/api", apiKeyMiddleware, routes);

// 404
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

// error handler
app.use(errorMiddleware);

module.exports = app;
