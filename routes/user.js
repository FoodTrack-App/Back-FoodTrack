const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");

// Obtener perfil de usuario
router.get("/:userId", userController.getUserProfile);

// Actualizar información de contacto
router.put("/:userId/contact", userController.updateContactInfo);

// Cambiar contraseña
router.put("/:userId/password", userController.changePassword);

module.exports = router;
