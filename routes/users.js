const express = require("express");
const router = express.Router();
const usersController = require("../controllers/usersController");

// Obtener todos los usuarios de un restaurante
router.get("/restaurant/:claveRestaurante", usersController.getUsersByRestaurant);

// Crear nuevo usuario
router.post("/", usersController.createUser);

// Actualizar usuario
router.put("/:userId", usersController.updateUser);

// Eliminar usuario
router.delete("/:userId", usersController.deleteUser);

module.exports = router;
