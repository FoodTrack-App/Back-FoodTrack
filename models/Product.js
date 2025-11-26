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
  },
  { _id: true }
);

const productoSchema = new mongoose.Schema(
  {
    nombreProducto: {
      type: String,
      required: true,
    },
    imagenProducto: {
      type: String,
      required: true,
      default: "default",
    },
    descripcion: {
      type: String,
      required: true,
      default: "Sin descripción",
    },
    stockDisponible: {
      type: Number,
      required: true,
      min: 0,
    },
    costo: {
      type: Number,
      required: true,
      min: 0,
    },
    precioVenta: {
      type: Number,
      required: true,
      min: 0,
    },
    margenGanancia: {
      type: Number,
      default: 0,
    },
    extras: {
      type: [extraSchema],
      default: [],
    },
    categoria: {
      type: String,
      required: true,
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

// Middleware para calcular margen de ganancia antes de guardar
productoSchema.pre("save", function (next) {
  if (this.precioVenta > 0) {
    this.margenGanancia = ((this.precioVenta - this.costo) / this.precioVenta) * 100;
  } else {
    this.margenGanancia = 0;
  }
  next();
});

const Producto = mongoose.model("Producto", productoSchema);

module.exports = Producto;
