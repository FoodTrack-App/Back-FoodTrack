const Product = require("../models/Product");
const path = require("path");
const fs = require("fs").promises;

// Directorio de imágenes en el frontend (Next.js public)
const FRONT_PUBLIC_PRODUCTS_DIR = path.join(__dirname, "../../Front-FoodTrack/public/products");

// Asegurar que el directorio existe
const ensureUploadDir = async () => {
  try {
    await fs.access(FRONT_PUBLIC_PRODUCTS_DIR);
  } catch {
    await fs.mkdir(FRONT_PUBLIC_PRODUCTS_DIR, { recursive: true });
  }
};

// Reconstruir arrays anidados enviados como campos planos de FormData (e.g., extras[0][nombreExtra])
const reconstructArrayFromBody = (body, baseKey) => {
  try {
    const items = {};
    const bracketPattern = new RegExp(`^${baseKey}\\[(\\d+)\\]\\[(.+)\\]$`);

    Object.keys(body || {}).forEach((key) => {
      const match = key.match(bracketPattern);
      if (match) {
        const idx = parseInt(match[1], 10);
        const prop = match[2];
        if (!items[idx]) items[idx] = {};
        items[idx][prop] = body[key];
      }
    });

    const array = Object.keys(items)
      .sort((a, b) => parseInt(a, 10) - parseInt(b, 10))
      .map((k) => items[k]);

    return array;
  } catch (e) {
    console.log(`✗ Error reconstruyendo ${baseKey}:`, e.message);
    return [];
  }
};

// Obtener todos los productos de un restaurante
exports.getProductsByRestaurant = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;

    console.log("Obteniendo productos del restaurante:", claveRestaurante);

    const products = await Product.find({ claveRestaurante }).sort({ fechaRegistro: -1 });

    console.log(`${products.length} productos encontrados`);
    if (products.length > 0) {
      console.log("Primer producto tiene extras:", products[0].extras?.length || 0);
    }

    return res.status(200).json({
      success: true,
      data: products,
    });
  } catch (error) {
    console.error("Error al obtener productos:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear nuevo producto
exports.createProduct = async (req, res) => {
  try {
    await ensureUploadDir();

    const { nombreProducto, descripcion, stockDisponible, costo, precioVenta, categoria, claveRestaurante } = req.body;

    console.log("=== CREAR PRODUCTO ===");
    console.log("Body recibido:", req.body);
    console.log("Archivo recibido:", req.file ? req.file.filename : "No");

    // Validaciones
    if (!nombreProducto || !stockDisponible || !costo || !precioVenta || !categoria || !claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos requeridos deben estar presentes",
      });
    }

    // Si no hay imagen, usar "default" para que el frontend use imagen por categoría
    // Cuando hay imagen, ahora se guarda en Front/public/products y se sirve como /products/...
    const imagePath = req.file ? `/products/${req.file.filename}` : "default";
    
    // Si no hay descripción, usar "Sin descripción"
    const finalDescripcion = descripcion && descripcion.trim() !== "" ? descripcion.trim() : "Sin descripción";

    // Procesar extras del FormData
    let extras = [];
    
    console.log("=== PROCESANDO EXTRAS ===");
    console.log("req.body.extrasData:", req.body.extrasData);
    console.log("req.body.extras:", req.body.extras);
    
    // PRIORIDAD 1: Leer desde extrasData (campo de texto plano con JSON)
    if (req.body.extrasData) {
      try {
        console.log("→ Parseando extrasData como JSON");
        const parsed = typeof req.body.extrasData === "string" 
          ? JSON.parse(req.body.extrasData) 
          : req.body.extrasData;
        
        if (Array.isArray(parsed)) {
          extras = parsed
            .filter(e => e && typeof e.nombreExtra === "string" && e.nombreExtra.trim() !== "" && e.costoExtra !== undefined && e.costoExtra !== null)
            .map(e => ({
              nombreExtra: String(e.nombreExtra).trim(),
              costoExtra: parseFloat(String(e.costoExtra)),
              activo: e.activo !== undefined ? Boolean(e.activo) : true,
            }))
            .filter(e => Number.isFinite(e.costoExtra));
          console.log(`✓ ${extras.length} extras válidos desde extrasData:`, JSON.stringify(extras, null, 2));
        }
      } catch (e) {
        console.log("✗ Error al parsear extrasData:", e.message);
      }
    }
    // FALLBACK: Intentar desde req.body.extras (por compatibilidad)
    else if (req.body.extras) {
      try {
        console.log("→ Intentando parsear extras como JSON (fallback)");
        const parsed = typeof req.body.extras === "string" 
          ? JSON.parse(req.body.extras) 
          : req.body.extras;
        
        if (Array.isArray(parsed)) {
          extras = parsed
            .filter(e => e && typeof e.nombreExtra === "string" && e.nombreExtra.trim() !== "" && e.costoExtra !== undefined && e.costoExtra !== null)
            .map(e => ({
              nombreExtra: String(e.nombreExtra).trim(),
              costoExtra: parseFloat(String(e.costoExtra)),
              activo: e.activo !== undefined ? Boolean(e.activo) : true,
            }))
            .filter(e => Number.isFinite(e.costoExtra));
          console.log(`✓ ${extras.length} extras válidos desde extras:`, extras);
        }
      } catch (e) {
        console.log("✗ Error al parsear JSON de extras:", e.message);
      }
    } else {
      console.log("⚠ No se recibieron extras");
    }

    // Log final antes de crear el producto
    console.log("=== EXTRAS FINALES ANTES DE GUARDAR ===");
    console.log("Array extras:", JSON.stringify(extras, null, 2));
    console.log("Total extras a guardar:", extras.length);

    // Crear objeto del producto (incluyendo extras si llegaron)
    const productData = {
      nombreProducto: nombreProducto.trim(),
      imagenProducto: imagePath,
      descripcion: finalDescripcion,
      stockDisponible: parseInt(stockDisponible),
      costo: parseFloat(costo),
      precioVenta: parseFloat(precioVenta),
      categoria: categoria.trim(),
      claveRestaurante: claveRestaurante.trim(),
      extras: extras,
    };

    console.log("Datos a guardar:", productData);

    const newProduct = new Product(productData);
    await newProduct.save();

    console.log("✓ Producto creado:", newProduct._id);
    console.log("✓ Con", newProduct.extras.length, "extras guardados");
    if (newProduct.extras.length > 0) {
      console.log("✓ Extras guardados en BD:", JSON.stringify(newProduct.extras, null, 2));
    }

    return res.status(201).json({
      success: true,
      message: "Producto creado exitosamente",
      data: newProduct,
    });
  } catch (error) {
    console.error("✗ Error al crear producto:");
    console.error("  Mensaje:", error.message);
    console.error("  Stack:", error.stack);
    console.error("  Datos recibidos:", {
      body: req.body,
      hasFile: !!req.file,
    });
    return res.status(500).json({
      success: false,
      message: "Error del servidor al crear producto",
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined,
    });
  }
};

// Actualizar producto
exports.updateProduct = async (req, res) => {
  try {
    const { productId } = req.params;
    const { nombreProducto, descripcion, stockDisponible, costo, precioVenta, categoria } = req.body;

    console.log("=== ACTUALIZAR PRODUCTO ===");
    console.log("Producto ID:", productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Si hay nueva imagen, actualizar
    if (req.file) {
      await ensureUploadDir();

      // Eliminar imagen anterior si existe y no es la imagen por defecto
      if (product.imagenProducto && product.imagenProducto !== "default") {
        // Compatibilidad: manejar imágenes antiguas en /uploads/products y nuevas en /products
        const oldFileName = path.basename(product.imagenProducto);
        const oldImagePath = product.imagenProducto.startsWith("/products/")
          ? path.join(FRONT_PUBLIC_PRODUCTS_DIR, oldFileName)
          : path.join(__dirname, "../uploads/products", oldFileName);
        try {
          await fs.unlink(oldImagePath);
        } catch (err) {
          console.log("No se pudo eliminar la imagen anterior:", err.message);
        }
      }

      product.imagenProducto = `/products/${req.file.filename}`;
    }

    // Actualizar campos básicos
    if (nombreProducto) product.nombreProducto = nombreProducto;
    if (descripcion !== undefined) {
      product.descripcion = descripcion && descripcion.trim() !== "" ? descripcion : "Sin descripción";
    }
    if (stockDisponible !== undefined) product.stockDisponible = parseInt(stockDisponible);
    if (costo !== undefined) product.costo = parseFloat(costo);
    if (precioVenta !== undefined) product.precioVenta = parseFloat(precioVenta);
    if (categoria) product.categoria = categoria;

    // Procesar nuevos extras si vienen en el body
    console.log("=== PROCESANDO NUEVOS EXTRAS ===");
    console.log("req.body.newExtrasData:", req.body.newExtrasData);
    
    let newExtras = [];
    
    // PRIORIDAD: Leer desde newExtrasData (campo de texto plano con JSON)
    if (req.body.newExtrasData) {
      try {
        console.log("→ Parseando newExtrasData como JSON");
        const parsed = typeof req.body.newExtrasData === "string" 
          ? JSON.parse(req.body.newExtrasData) 
          : req.body.newExtrasData;
        
        if (Array.isArray(parsed) && parsed.length > 0) {
          newExtras = parsed
            .filter(e => e && typeof e.nombreExtra === "string" && e.nombreExtra.trim() !== "" && e.costoExtra !== undefined && e.costoExtra !== null)
            .map(e => ({
              nombreExtra: String(e.nombreExtra).trim(),
              costoExtra: parseFloat(String(e.costoExtra)),
              activo: e.activo !== undefined ? Boolean(e.activo) : true,
            }))
            .filter(e => Number.isFinite(e.costoExtra));
          console.log(`✓ ${newExtras.length} nuevos extras válidos desde newExtrasData:`, JSON.stringify(newExtras, null, 2));
        }
      } catch (e) {
        console.log("✗ Error al parsear newExtrasData:", e.message);
      }
    } else {
      console.log("⚠ No se recibieron nuevos extras para agregar");
    }

    // Log final antes de agregar al producto
    console.log("=== NUEVOS EXTRAS FINALES ANTES DE AGREGAR ===");
    console.log("Array newExtras:", JSON.stringify(newExtras, null, 2));
    console.log("Total nuevos extras a agregar:", newExtras.length);
    console.log("Extras actuales en producto:", product.extras.length);

    // Agregar nuevos extras al producto
    if (newExtras.length > 0) {
      product.extras.push(...newExtras);
      console.log("✓ Nuevos extras agregados. Total ahora:", product.extras.length);
    }

    await product.save();

    console.log("✓ Producto actualizado exitosamente");
    console.log("✓ Total extras en producto:", product.extras.length);

    return res.status(200).json({
      success: true,
      message: "Producto actualizado exitosamente",
      data: product,
    });
  } catch (error) {
    console.error("✗ Error al actualizar producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar producto
exports.deleteProduct = async (req, res) => {
  try {
    const { productId } = req.params;

    console.log("Eliminando producto:", productId);

    const product = await Product.findById(productId);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Producto no encontrado",
      });
    }

    // Eliminar imagen del servidor (en frontend public o en uploads legacy)
    if (product.imagenProducto && product.imagenProducto !== "default") {
      const fileName = path.basename(product.imagenProducto);
      const publicPath = path.join(FRONT_PUBLIC_PRODUCTS_DIR, fileName);
      const legacyPath = path.join(__dirname, "../uploads/products", fileName);
      try {
        await fs.unlink(publicPath);
      } catch (err) {
        // Si no estaba en public, intentar eliminar en uploads legacy
        try { await fs.unlink(legacyPath); } catch (_) {}
      }
    }

    await Product.findByIdAndDelete(productId);

    console.log("Producto eliminado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Producto eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar producto:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// ============================================
// GESTIÓN DE EXTRAS (consolidado en productController)
// ============================================

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

// Actualizar estado (activo/inactivo) de un extra específico
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

// Actualizar datos de un extra específico (nombre, costo)
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

// Eliminar un extra específico
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
