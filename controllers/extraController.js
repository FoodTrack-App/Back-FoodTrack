const Extra = require("../models/Extra");

// Obtener todos los extras de un producto
exports.getExtrasByProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("Obteniendo extras del producto:", productId);

    const extras = await Extra.find({ productoId: productId }).sort({ nombreExtra: 1 });

    return res.status(200).json({
      success: true,
      data: extras,
    });
  } catch (error) {
    console.error("Error al obtener extras:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear múltiples extras para un producto
exports.createExtras = async (req, res) => {
  try {
    const { productoId, extras, claveRestaurante } = req.body;

    console.log("Creando extras para producto:", { productoId, cantidadExtras: extras?.length });

    // Validaciones
    if (!productoId || !extras || !Array.isArray(extras) || extras.length === 0) {
      return res.status(400).json({
        success: false,
        message: "El ID del producto y al menos un extra son requeridos",
      });
    }

    if (!claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "La clave del restaurante es requerida",
      });
    }

    // Crear todos los extras
    const extrasCreated = [];
    for (const extra of extras) {
      const { nombreExtra, costoExtra } = extra;

      if (!nombreExtra || costoExtra === undefined) {
        continue; // Saltar extras inválidos
      }

      const newExtra = new Extra({
        nombreExtra: nombreExtra.trim(),
        costoExtra: parseFloat(costoExtra),
        activo: true,
        productoId,
        claveRestaurante,
      });

      try {
        await newExtra.save();
        extrasCreated.push(newExtra);
      } catch (err) {
        // Si ya existe, continuar con el siguiente
        if (err.code === 11000) {
          console.log(`Extra duplicado: ${nombreExtra}`);
        } else {
          throw err;
        }
      }
    }

    console.log(`${extrasCreated.length} extras creados exitosamente`);

    return res.status(201).json({
      success: true,
      message: "Extras creados exitosamente",
      data: extrasCreated,
    });
  } catch (error) {
    console.error("Error al crear extras:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar estado de un extra
exports.updateExtraStatus = async (req, res) => {
  try {
    const { extraId } = req.params;
    const { activo } = req.body;

    console.log("Actualizando estado del extra:", { extraId, activo });

    if (activo === undefined) {
      return res.status(400).json({
        success: false,
        message: "El estado 'activo' es requerido",
      });
    }

    const extra = await Extra.findById(extraId);

    if (!extra) {
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    extra.activo = activo;
    await extra.save();

    console.log("Estado del extra actualizado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Estado del extra actualizado exitosamente",
      data: extra,
    });
  } catch (error) {
    console.error("Error al actualizar estado del extra:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar un extra (nombre y costo)
exports.updateExtra = async (req, res) => {
  try {
    const { extraId } = req.params;
    const { nombreExtra, costoExtra } = req.body;

    console.log("Actualizando extra:", extraId);

    const extra = await Extra.findById(extraId);

    if (!extra) {
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    if (nombreExtra) extra.nombreExtra = nombreExtra.trim();
    if (costoExtra !== undefined) extra.costoExtra = parseFloat(costoExtra);

    await extra.save();

    console.log("Extra actualizado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Extra actualizado exitosamente",
      data: extra,
    });
  } catch (error) {
    console.error("Error al actualizar extra:", error);
    
    // Manejar error de duplicado
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "Ya existe un extra con ese nombre para este producto",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar un extra
exports.deleteExtra = async (req, res) => {
  try {
    const { extraId } = req.params;

    console.log("Eliminando extra:", extraId);

    const extra = await Extra.findById(extraId);

    if (!extra) {
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    await Extra.findByIdAndDelete(extraId);

    console.log("Extra eliminado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Extra eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar extra:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
