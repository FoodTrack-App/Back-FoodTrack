const express = require("express");
const router = express.Router();
const movementController = require("../controllers/movementController");

// Obtener movimientos por restaurante y fecha
router.get("/restaurant/:claveRestaurante", movementController.getMovementsByDate);

// Obtener resumen de caja
router.get("/restaurant/:claveRestaurante/summary", movementController.getCashSummary);

// Crear nuevo movimiento
router.post("/", movementController.createMovement);

// Eliminar movimiento
router.delete("/:movementId", movementController.deleteMovement);

module.exports = router;
