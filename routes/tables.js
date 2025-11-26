const express = require("express");
const router = express.Router();
const tableController = require("../controllers/tableController");

// Obtener mesas de un restaurante
router.get("/restaurant/:claveRestaurante", tableController.getTables);

// Configurar cantidad de mesas
router.post("/configure", tableController.configureTables);

// Actualizar nombre personalizado
router.put("/:tableId/name", tableController.updateTableName);

// Activar/desactivar mesa
router.put("/:tableId/status", tableController.toggleTableStatus);

module.exports = router;
