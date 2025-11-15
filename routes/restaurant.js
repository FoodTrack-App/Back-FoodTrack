const express = require("express");
const router = express.Router();
const restaurantController = require("../controllers/restaurantController");

// Ruta para validar la clave del restaurante
router.post("/validate-key", restaurantController.validateRestaurantKey);

// Ruta para obtener todos los restaurantes
router.get("/", restaurantController.getAllRestaurants);

module.exports = router;
