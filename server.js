const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");

const authRoutes = require("./routes/auth");

const app = express();

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Conexión MongoDB local
mongoose
  .connect("mongodb://127.0.0.1:27017/loginDB", { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB conectado"))
  .catch((err) => console.error("Error al conectar MongoDB:", err));

// Rutas
app.use("/api/auth", authRoutes);

// Servidor
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
