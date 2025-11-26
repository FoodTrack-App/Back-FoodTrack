const mongoose = require("mongoose");

const categoriaSchema = new mongoose.Schema(
  {
    nombreCategoria: {
      type: String,
      required: true,
    },
    descripcion: {
      type: String,
      default: "",
    },
    claveRestaurante: {
      type: String,
      required: true,
      index: true,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Índice compuesto para evitar categorías duplicadas por restaurante
categoriaSchema.index({ nombreCategoria: 1, claveRestaurante: 1 }, { unique: true });

const Categoria = mongoose.model("Categoria", categoriaSchema);

module.exports = Categoria;
