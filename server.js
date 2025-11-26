require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

const authRoutes = require("./routes/auth");
const restaurantRoutes = require("./routes/restaurant");
const userRoutes = require("./routes/user");
const usersRoutes = require("./routes/users");
const productRoutes = require("./routes/products");
const categoryRoutes = require("./routes/categories");
const extraRoutes = require("./routes/extras");
const tableRoutes = require("./routes/tables");
const accountRoutes = require("./routes/accounts");
const movementRoutes = require("./routes/movements");

const app = express();

// Middlewares
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));
app.use(bodyParser.json());

// Log de peticiones
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Servir archivos estáticos (imágenes de productos)
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// Conexión MongoDB local
mongoose
  .connect("mongodb://127.0.0.1:27017/food_trackBD")
  .then(() => console.log("MongoDB conectado a food_trackBD"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Rutas
app.use("/api/auth", authRoutes);
app.use("/api/restaurant", restaurantRoutes);
app.use("/api/user", userRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/products", productRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/extras", extraRoutes);
app.use("/api/tables", tableRoutes);
app.use("/api/accounts", accountRoutes);
app.use("/api/movements", movementRoutes);

console.log("✅ Rutas registradas:");
console.log("   - /api/auth");
console.log("   - /api/restaurant");
console.log("   - /api/user");
console.log("   - /api/users");
console.log("   - /api/products");
console.log("   - /api/categories");
console.log("   - /api/extras");
console.log("   - /api/tables");
console.log("   - /api/accounts");
console.log("   - /api/movements");

// Manejo de errores global
app.use((err, req, res, next) => {
  console.error("Error no capturado:", err);
  res.status(500).json({
    success: false,
    message: "Error interno del servidor",
    error: err.message,
  });
});

// Servidor
const PORT = 5000;
const HOST = '0.0.0.0';
app.listen(PORT, HOST, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`También accesible desde la red en http://148.220.214.146:${PORT}`);
});