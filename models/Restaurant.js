const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema(
  {
    claveRestaurante: {
      type: String,
      required: true,
      unique: true,
    },
    nombreRestaurante: {
      type: String,
      required: true,
    },
    fechaRegistro: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: false,
    collection: "restaurantes",
  }
);

module.exports = mongoose.model("Restaurant", restaurantSchema);
