const mongoose = require("mongoose");

// Conectar a MongoDB
mongoose
  .connect("mongodb://127.0.0.1:27017/food_trackBD")
  .then(() => {
    console.log("✅ MongoDB conectado");
    return testUsers();
  })
  .catch((err) => {
    console.error("❌ Error al conectar:", err);
    process.exit(1);
  });

async function testUsers() {
  try {
    // Buscar en la colección usuarios
    const User = mongoose.model(
      "User",
      new mongoose.Schema({}, { strict: false, collection: "usuarios" })
    );

    const users = await User.find({});
    console.log("\n👥 Usuarios encontrados:", users.length);
    
    if (users.length > 0) {
      console.log("\n📋 Datos del primer usuario:");
      console.log(JSON.stringify(users[0], null, 2));
      
      console.log("\n📋 Campos disponibles:");
      console.log(Object.keys(users[0].toObject()));
    }

    mongoose.connection.close();
    console.log("\n✅ Test completado");
  } catch (error) {
    console.error("❌ Error en test:", error);
    mongoose.connection.close();
  }
}
