const User = require("../models/User");

exports.loginUser = async (req, res) => {
  try {
    const { username, password, claveRestaurante } = req.body;

    // Validar que se envíen todos los campos requeridos
    if (!username || !password || !claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "Usuario, contraseña y clave del restaurante son requeridos",
      });
    }

    console.log("🔍 Intentando login:", { username, claveRestaurante });

    // Buscar usuario por usuario, contraseña y claveRestaurante
    const user = await User.findOne({
      usuario: username,
      contraseña: password,
      claveRestaurante: claveRestaurante,
    });

    if (!user) {
      console.log("Usuario no encontrado o credenciales incorrectas");
      return res.status(401).json({
        success: false,
        message: "Usuario o contraseña incorrectos",
      });
    }

    console.log("Login exitoso:", user.usuario, "- Rol:", user.rol);

    // Login exitoso - devolver datos del usuario y rol
    return res.status(200).json({
      success: true,
      message: "Login exitoso",
      data: {
        usuario: user.usuario,
        rol: user.rol,
        nombreContacto: user.nombreContacto,
        correoContacto: user.correoContacto,
        telefonoContacto: user.telefonoContacto,
        fotoPerfil: user.fotoPerfil,
        claveRestaurante: user.claveRestaurante,
      },
    });
  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
