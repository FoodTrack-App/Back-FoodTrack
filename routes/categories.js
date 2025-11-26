const express = require("express");
const router = express.Router();
const categoryController = require("../controllers/categoryController");

// Rutas
router.get("/restaurant/:claveRestaurante", categoryController.getCategoriesByRestaurant);
router.post("/", categoryController.createCategory);
router.delete("/:categoryId", categoryController.deleteCategory);

module.exports = router;
