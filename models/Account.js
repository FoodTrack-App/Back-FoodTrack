const mongoose = require("mongoose");

const accountItemSchema = new mongoose.Schema({
  productoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  nombreProducto: {
    type: String,
    required: true,
  },
  imagenProducto: {
    type: String,
  },
  precioBase: {
    type: Number,
    required: true,
  },
  cantidad: {
    type: Number,
    required: true,
    default: 1,
  },
  extras: [{
    nombreExtra: {
      type: String,
      required: true,
    },
    costoExtra: {
      type: Number,
      required: true,
    },
  }],
  comentarios: {
    type: String,
    default: "",
  },
  precioTotal: {
    type: Number,
    required: true,
  },
  comandado: {
    type: Boolean,
    default: false,
  },
  fechaComandado: {
    type: Date,
  },
});

const accountSchema = new mongoose.Schema({
  numeroTicket: {
    type: Number,
    required: true,
  },
  mesa: {
    numeroMesa: {
      type: Number,
      required: true,
    },
    nombrePersonalizado: {
      type: String,
      default: "",
    },
  },
  mesero: {
    type: String,
    required: true,
  },
  items: [accountItemSchema],
  subtotal: {
    type: Number,
    default: 0,
  },
  estado: {
    type: String,
    enum: ["abierta", "finalizada", "cerrada", "cancelada"],
    default: "abierta",
  },
  claveRestaurante: {
    type: String,
    required: true,
  },
  fechaApertura: {
    type: Date,
    default: Date.now,
  },
  fechaCierre: {
    type: Date,
  },
  metodoPago: {
    type: String,
    enum: ["efectivo", "tarjeta", "transferencia", ""],
    default: "",
  },
  totalPagado: {
    type: Number,
    default: 0,
  },
});

// Índice para búsqueda rápida de cuentas abiertas
accountSchema.index({ estado: 1, claveRestaurante: 1 });
accountSchema.index({ numeroTicket: 1, claveRestaurante: 1 }, { unique: true });

module.exports = mongoose.model("Account", accountSchema);
