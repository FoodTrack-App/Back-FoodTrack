const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    usuario: {
      type: String,
      required: true,
    },
    contraseña: {
      type: String,
      required: true,
    },
    rol: {
      type: String,
      required: true,
      enum: ["Administrador", "Mesero", "Cajero"],
    },
    claveRestaurante: {
      type: String,
      required: true,
    },
    nombreContacto: {
      type: String,
    },
    correoContacto: {
      type: String,
    },
    telefonoContacto: {
      type: String,
    },
    fotoPerfil: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: false,
    collection: "usuarios",
  }
);

module.exports = mongoose.model("User", userSchema);
