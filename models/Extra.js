const mongoose = require("mongoose");

const extraSchema = new mongoose.Schema(
  {
    nombreExtra: {
      type: String,
      required: true,
    },
    costoExtra: {
      type: Number,
      required: true,
      min: 0,
    },
    activo: {
      type: Boolean,
      default: true,
    },
    productoId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Producto",
      required: true,
      index: true,
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

// Índice compuesto para evitar extras duplicados por producto
extraSchema.index({ nombreExtra: 1, productoId: 1 }, { unique: true });

const Extra = mongoose.model("Extra", extraSchema);

module.exports = Extra;
