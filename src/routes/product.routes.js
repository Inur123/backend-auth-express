const router = require("express").Router();
const productController = require("../controllers/product.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// public
router.get("/", productController.list);
router.get("/:id", productController.detail);

// protected
router.post("/", authMiddleware, productController.create);
router.put("/:id", authMiddleware, productController.update);
router.delete("/:id", authMiddleware, productController.remove);

module.exports = router;
