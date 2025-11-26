const Category = require("../models/Category");

// Obtener todas las categorías de un restaurante
exports.getCategoriesByRestaurant = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;

    console.log("Obteniendo categorías del restaurante:", claveRestaurante);

    const categories = await Category.find({ claveRestaurante }).sort({ nombreCategoria: 1 });

    return res.status(200).json({
      success: true,
      data: categories,
    });
  } catch (error) {
    console.error("Error al obtener categorías:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear nueva categoría
exports.createCategory = async (req, res) => {
  try {
    const { nombreCategoria, descripcion, claveRestaurante } = req.body;

    console.log("Creando nueva categoría:", { nombreCategoria, claveRestaurante });

    // Validaciones
    if (!nombreCategoria || !claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "El nombre de la categoría y la clave del restaurante son requeridos",
      });
    }

    // Verificar si la categoría ya existe
    const existingCategory = await Category.findOne({ 
      nombreCategoria: nombreCategoria.trim(), 
      claveRestaurante 
    });

    if (existingCategory) {
      return res.status(400).json({
        success: false,
        message: "Esta categoría ya existe en el restaurante",
      });
    }

    // Crear categoría
    const newCategory = new Category({
      nombreCategoria: nombreCategoria.trim(),
      descripcion: descripcion || "",
      claveRestaurante,
    });

    await newCategory.save();

    console.log("Categoría creada exitosamente:", newCategory.nombreCategoria);

    return res.status(201).json({
      success: true,
      message: "Categoría creada exitosamente",
      data: newCategory,
    });
  } catch (error) {
    console.error("Error al crear categoría:", error);
    
    // Manejar error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Esta categoría ya existe en el restaurante",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar categoría
exports.deleteCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    console.log("Eliminando categoría:", categoryId);

    const category = await Category.findById(categoryId);

    if (!category) {
      return res.status(404).json({
        success: false,
        message: "Categoría no encontrada",
      });
    }

    await Category.findByIdAndDelete(categoryId);

    console.log("Categoría eliminada exitosamente");

    return res.status(200).json({
      success: true,
      message: "Categoría eliminada exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar categoría:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
