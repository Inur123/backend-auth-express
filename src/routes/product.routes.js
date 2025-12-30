const router = require("express").Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");
const { addClient } = require("../utils/sse");

// ✅ realtime stream (taruh di atas "/:id" supaya tidak ketabrak)
router.get("/stream", (req, res) => {
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  // kalau res.flushHeaders ada (tergantung environment)
  if (typeof res.flushHeaders === "function") res.flushHeaders();

  const ping = setInterval(() => {
    res.write("event: ping\ndata: {}\n\n");
  }, 25000);

  addClient(res);
  res.write("event: connected\ndata: {}\n\n");

  req.on("close", () => {
    clearInterval(ping);
  });
});

// public
router.get("/", productController.list);
router.get("/:id", productController.detail);

// protected
router.post("/", authMiddleware, productController.create);
router.put("/:id", authMiddleware, productController.update);
router.delete("/:id", authMiddleware, productController.remove);

module.exports = router;
