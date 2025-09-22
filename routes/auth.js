const express = require("express");
const { loginUser } = require("../controllers/authController");

const router = express.Router();

// Ruta de login
router.post("/login", loginUser);

module.exports = router;
