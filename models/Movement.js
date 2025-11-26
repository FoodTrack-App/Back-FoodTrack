const mongoose = require("mongoose");

const movementSchema = new mongoose.Schema(
  {
    claveRestaurante: {
      type: String,
      required: true,
    },
    tipo: {
      type: String,
      enum: ["ingreso", "egreso"],
      required: true,
    },
    descripcion: {
      type: String,
      required: true,
    },
    monto: {
      type: Number,
      required: true,
    },
    metodoPago: {
      type: String,
      enum: ["efectivo", "tarjeta", "transferencia", "otro"],
      default: "efectivo",
    },
    fecha: {
      type: Date,
      default: Date.now,
    },
    // Referencia opcional a cuenta si el movimiento proviene de una venta
    cuentaId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
    },
  },
  {
    timestamps: true,
  }
);

// Índice para búsquedas por restaurante y fecha
movementSchema.index({ claveRestaurante: 1, fecha: 1 });

module.exports = mongoose.model("Movement", movementSchema, "movimientos");
