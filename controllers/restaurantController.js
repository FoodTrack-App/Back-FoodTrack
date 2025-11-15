const Restaurant = require("../models/Restaurant");

// Validar clave del restaurante
exports.validateRestaurantKey = async (req, res) => {
  try {
    const { clave } = req.body;
    console.log("🔍 Buscando clave:", clave);

    if (!clave) {
      return res.status(400).json({
        success: false,
        message: "La clave del restaurante es requerida",
      });
    }

    // Buscar restaurante por clave
    const restaurant = await Restaurant.findOne({ claveRestaurante: clave });
    console.log("📋 Restaurante encontrado:", restaurant);

    if (!restaurant) {
      // Ver todos los restaurantes para debug
      const allRestaurants = await Restaurant.find({});
      console.log("📊 Total restaurantes en BD:", allRestaurants.length);
      if (allRestaurants.length > 0) {
        console.log("📄 Primer restaurante:", allRestaurants[0]);
      }
      
      return res.status(404).json({
        success: false,
        message: "Clave de restaurante no válida",
      });
    }

    // Si se encuentra el restaurante, devolver sus datos
    return res.status(200).json({
      success: true,
      message: "Restaurante encontrado",
      data: {
        id: restaurant._id,
        claveRestaurante: restaurant.claveRestaurante,
        nombreRestaurante: restaurant.nombreRestaurante,
        fechaRegistro: restaurant.fechaRegistro,
      },
    });
  } catch (error) {
    console.error("Error al validar clave del restaurante:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Obtener todos los restaurantes
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.find({});
    
    return res.status(200).json({
      success: true,
      data: restaurants,
    });
  } catch (error) {
    console.error("Error al obtener restaurantes:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
