const mongoose = require("mongoose");

// Conectar a MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/food_trackBD")
  .then(() => {
    console.log("✅ MongoDB conectado");
    return testRestaurants();
  })
  .catch((err) => {
    console.error("❌ Error al conectar:", err);
    process.exit(1);
  });

async function testRestaurants() {
  try {
    // Obtener todas las colecciones
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log("\n📁 Colecciones en la BD:");
    collections.forEach(col => console.log("  -", col.name));

    // Buscar en la colección restaurantes
    const Restaurant = mongoose.model(
      "Restaurant",
      new mongoose.Schema({}, { strict: false, collection: "restaurantes" })
    );

    const restaurants = await Restaurant.find({});
    console.log("\n🍽️  Restaurantes encontrados:", restaurants.length);
    
    if (restaurants.length > 0) {
      console.log("\n📋 Datos del primer restaurante:");
      console.log(JSON.stringify(restaurants[0], null, 2));
    }

    // Buscar específicamente por la clave
    const testKey = "QRO112501";
    console.log(`\n🔍 Buscando restaurante con clave: ${testKey}`);
    
    const foundByKey = await Restaurant.findOne({ claveRestaurante: testKey });
    console.log("Resultado búsqueda por 'claveRestaurante':", foundByKey ? "✅ ENCONTRADO" : "❌ NO ENCONTRADO");

    if (!foundByKey) {
      // Intentar buscar con diferentes variaciones
      const allDocs = await Restaurant.find({}).lean();
      console.log("\n🔎 Verificando campos disponibles:");
      if (allDocs.length > 0) {
        console.log("Campos del primer documento:", Object.keys(allDocs[0]));
      }
    }

    mongoose.connection.close();
    console.log("\n✅ Test completado");
  } catch (error) {
    console.error("❌ Error en test:", error);
    mongoose.connection.close();
  }
}
