const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema({
  numeroMesa: {
    type: Number,
    required: true,
  },
  nombrePersonalizado: {
    type: String,
    default: "",
  },
  claveRestaurante: {
    type: String,
    required: true,
  },
  activa: {
    type: Boolean,
    default: false,
  },
  fechaRegistro: {
    type: Date,
    default: Date.now,
  },
});

// Índice compuesto para evitar duplicados de mesa por restaurante
tableSchema.index({ numeroMesa: 1, claveRestaurante: 1 }, { unique: true });

module.exports = mongoose.model("Table", tableSchema);
