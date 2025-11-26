const express = require("express");
const router = express.Router();
const extraController = require("../controllers/extraController");

// Rutas - IMPORTANTE: Las rutas más específicas primero
router.get("/product/:productId", extraController.getExtrasByProduct);
router.post("/", extraController.createExtras);
router.put("/:extraId/status", extraController.updateExtraStatus);
router.put("/:extraId", extraController.updateExtra);
router.delete("/:extraId", extraController.deleteExtra);

module.exports = router;
