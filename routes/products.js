const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const productController = require("../controllers/productController");

// Directorio destino en el frontend (Next.js public)
const FRONT_PUBLIC_PRODUCTS_DIR = path.join(__dirname, "../../Front-FoodTrack/public/products");

// Asegurar que exista el directorio destino antes de inicializar multer
try {
  fs.mkdirSync(FRONT_PUBLIC_PRODUCTS_DIR, { recursive: true });
} catch (e) {
  console.error("No se pudo crear el directorio de imágenes en el frontend:", e.message);
}

// Configuración de multer para subida de imágenes
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, FRONT_PUBLIC_PRODUCTS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, "product-" + uniqueSuffix + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: function (req, file, cb) {
    const filetypes = /jpeg|jpg|png|gif/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error("Solo se permiten imágenes (jpeg, jpg, png, gif)"));
  },
});

// Middleware para loggear el body después de multer
const logBody = (req, res, next) => {
  try {
    console.log("=== DESPUÉS DE MULTER ===");
    console.log("req.body.extrasData:", req.body.extrasData);
    console.log("req.file:", req.file ? req.file.filename : "No");
    console.log("Todas las claves en body:", Object.keys(req.body));
    next();
  } catch (error) {
    console.error("Error en logBody middleware:", error);
    next();
  }
};

// Ruta de prueba para ver qué llega en FormData
router.post("/test-extras", upload.single("imagen"), (req, res) => {
  console.log("=== TEST EXTRAS ===");
  console.log("req.body completo:", JSON.stringify(req.body, null, 2));
  console.log("\nTodas las claves:", Object.keys(req.body));
  console.log("\nValores individuales:");
  Object.keys(req.body).forEach(key => {
    console.log(`  ${key}:`, typeof req.body[key], "=", req.body[key]);
  });
  
  res.json({
    success: true,
    received: req.body,
    keys: Object.keys(req.body),
  });
});

// Rutas de productos
router.get("/restaurant/:claveRestaurante", productController.getProductsByRestaurant);
router.post("/", upload.single("imagen"), logBody, productController.createProduct);
router.put("/:productId", upload.single("imagen"), productController.updateProduct);
router.delete("/:productId", productController.deleteProduct);

// Rutas de extras (todo manejado en productController)
router.get("/:productId/extras", productController.getProductExtras);
router.put("/:productId/extras/:extraId/status", productController.updateExtraStatus);
router.put("/:productId/extras/:extraId", productController.updateExtra);
router.delete("/:productId/extras/:extraId", productController.deleteExtra);

module.exports = router;
