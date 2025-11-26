const express = require("express");
const router = express.Router();
const accountController = require("../controllers/accountController");

// Obtener cuentas abiertas de un restaurante
router.get("/restaurant/:claveRestaurante/open", accountController.getOpenAccounts);

// Crear nueva cuenta
router.post("/", accountController.createAccount);

// Obtener detalle de cuenta
router.get("/:accountId", accountController.getAccountDetail);

// Agregar items a cuenta
router.post("/:accountId/items", accountController.addItemsToAccount);

// Comandar items (enviar a cocina)
router.post("/:accountId/send-to-kitchen", accountController.sendToKitchen);

// Eliminar item de cuenta
router.delete("/:accountId/items/:itemId", accountController.removeItem);

// Finalizar cuenta (para imprimir ticket)
router.put("/:accountId/finalize", accountController.finalizeAccount);

// Reabrir cuenta finalizada
router.put("/:accountId/reopen", accountController.reopenAccount);

// Cerrar cuenta (después de finalizar y pagar)
router.put("/:accountId/close", accountController.closeAccount);

module.exports = router;
