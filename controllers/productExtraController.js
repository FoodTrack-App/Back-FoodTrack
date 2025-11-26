const Product = require("../models/Product");

// Obtener extras de un producto
exports.getProductExtras = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("Obteniendo extras del producto:", productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: product.extras || [],
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

// Agregar extras a un producto
exports.addProductExtras = async (req, res) => {
  try {
    const { productId } = req.params;
    const { extras } = req.body;

    console.log("=== AGREGAR EXTRAS ===");
    console.log("Producto ID:", productId);
    console.log("Body recibido:", req.body);
    console.log("Extras array:", extras);

    if (!extras || !Array.isArray(extras)) {
      return res.status(400).json({
        success: false,
        message: "Se requiere un array de extras",
      });
    }

    // Permitir array vacío (para inicializar sin extras)
    if (extras.length === 0) {
      return res.status(200).json({
        success: true,
        message: "No hay extras para agregar",
        data: [],
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      console.log("✗ Producto no encontrado:", productId);
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    console.log("✓ Producto encontrado:", product.nombreProducto);
    console.log("Extras actuales:", product.extras.length);

    // Procesar y validar extras
    const newExtras = extras
      .filter(extra => {
        const isValid = extra.nombreExtra && 
                       extra.costoExtra !== undefined && 
                       extra.costoExtra !== null &&
                       extra.nombreExtra.trim() !== "";
        
        if (!isValid) {
          console.log("Extra inválido ignorado:", extra);
        }
        return isValid;
      })
      .map(extra => ({
        nombreExtra: extra.nombreExtra.trim(),
        costoExtra: parseFloat(extra.costoExtra),
        activo: extra.activo !== undefined ? Boolean(extra.activo) : true,
      }));

    console.log("Extras válidos a agregar:", newExtras.length);
    console.log("Datos:", JSON.stringify(newExtras, null, 2));

    // Agregar extras al array del producto
    product.extras.push(...newExtras);
    
    // Guardar producto
    const savedProduct = await product.save();

    console.log("✓ Extras guardados. Total en producto:", savedProduct.extras.length);

    // Retornar los extras recién agregados con sus IDs generados
    const addedExtras = savedProduct.extras.slice(-newExtras.length);

    return res.status(200).json({
      success: true,
      message: "Extras agregados exitosamente",
      data: addedExtras,
    });
  } catch (error) {
    console.error("✗ Error al agregar extras:", error);
    console.error("Stack:", error.stack);
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
    const { productId, extraId } = req.params;
    const { activo } = req.body;

    console.log("=== TOGGLE EXTRA STATUS ===");
    console.log("Producto ID:", productId);
    console.log("Extra ID:", extraId);
    console.log("Nuevo estado:", activo);

    if (activo === undefined || activo === null) {
      return res.status(400).json({
        success: false,
        message: "El campo 'activo' es requerido",
      });
    }

    const product = await Product.findById(productId);

    if (!product) {
      console.log("✗ Producto no encontrado");
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    console.log("✓ Producto encontrado:", product.nombreProducto);
    console.log("Extras totales:", product.extras.length);

    const extra = product.extras.id(extraId);

    if (!extra) {
      console.log("✗ Extra no encontrado");
      console.log("IDs disponibles:", product.extras.map(e => e._id.toString()));
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    console.log("✓ Extra encontrado:", extra.nombreExtra);
    console.log("Estado:", extra.activo, "→", activo);

    extra.activo = Boolean(activo);
    const savedProduct = await product.save();

    // Encontrar el extra actualizado en el producto guardado
    const updatedExtra = savedProduct.extras.id(extraId);

    console.log("✓ Estado actualizado en BD");

    return res.status(200).json({
      success: true,
      message: "Estado del extra actualizado exitosamente",
      data: updatedExtra,
    });
  } catch (error) {
    console.error("✗ Error al actualizar estado:", error);
    console.error("Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar un extra
exports.updateExtra = async (req, res) => {
  try {
    const { productId, extraId } = req.params;
    const { nombreExtra, costoExtra } = req.body;

    console.log("Actualizando extra:", { productId, extraId });

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    const extra = product.extras.id(extraId);

    if (!extra) {
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    if (nombreExtra) extra.nombreExtra = nombreExtra.trim();
    if (costoExtra !== undefined) extra.costoExtra = parseFloat(costoExtra);

    await product.save();

    console.log("Extra actualizado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Extra actualizado exitosamente",
      data: extra,
    });
  } catch (error) {
    console.error("Error al actualizar extra:", error);
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
    const { productId, extraId } = req.params;

    console.log("Eliminando extra:", { productId, extraId });

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    const extra = product.extras.id(extraId);

    if (!extra) {
      return res.status(404).json({
        success: false,
        message: "Extra no encontrado",
      });
    }

    extra.deleteOne();
    await product.save();

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
