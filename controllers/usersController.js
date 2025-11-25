const User = require("../models/User");

// Obtener todos los usuarios de un restaurante
exports.getUsersByRestaurant = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;

    console.log("Obteniendo usuarios del restaurante:", claveRestaurante);

    const users = await User.find({ 
      claveRestaurante,
      rol: { $in: ["Mesero", "Cajero"] } // Solo traer Meseros y Cajeros, no Administradores
    }).select("-contraseña");

    return res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear nuevo usuario
exports.createUser = async (req, res) => {
  try {
    const { usuario, contraseña, rol, claveRestaurante } = req.body;

    console.log("Creando nuevo usuario:", { usuario, rol, claveRestaurante });

    // Validaciones
    if (!usuario || !contraseña || !rol || !claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "Todos los campos son requeridos",
      });
    }

    if (contraseña.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La contraseña debe tener al menos 8 caracteres",
      });
    }

    if (!["Mesero", "Cajero"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser Mesero o Cajero",
      });
    }

    // Verificar si el usuario ya existe
    const existingUser = await User.findOne({ usuario, claveRestaurante });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "El nombre de usuario ya existe en este restaurante",
      });
    }

    // Crear usuario
    const newUser = new User({
      usuario,
      contraseña,
      rol,
      claveRestaurante,
      nombreContacto: "Nombre de Contacto",
      correoContacto: "Correo de contacto",
      telefonoContacto: "1234567890",
      fotoPerfil: null,
    });

    await newUser.save();

    console.log("Usuario creado exitosamente:", newUser.usuario);

    return res.status(201).json({
      success: true,
      message: "Usuario creado exitosamente",
      data: {
        _id: newUser._id,
        usuario: newUser.usuario,
        rol: newUser.rol,
        claveRestaurante: newUser.claveRestaurante,
        nombreContacto: newUser.nombreContacto,
        correoContacto: newUser.correoContacto,
        telefonoContacto: newUser.telefonoContacto,
      },
    });
  } catch (error) {
    console.error("Error al crear usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar usuario
exports.updateUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { usuario, rol } = req.body;

    console.log("Actualizando usuario:", userId, { usuario, rol });

    // Validaciones
    if (!usuario || !rol) {
      return res.status(400).json({
        success: false,
        message: "Usuario y rol son requeridos",
      });
    }

    if (!["Mesero", "Cajero"].includes(rol)) {
      return res.status(400).json({
        success: false,
        message: "El rol debe ser Mesero o Cajero",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar si el nuevo nombre de usuario ya existe (si cambió)
    if (usuario !== user.usuario) {
      const existingUser = await User.findOne({ 
        usuario, 
        claveRestaurante: user.claveRestaurante,
        _id: { $ne: userId }
      });
      
      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "El nombre de usuario ya existe en este restaurante",
        });
      }
    }

    // Actualizar usuario
    user.usuario = usuario;
    user.rol = rol;
    await user.save();

    console.log("Usuario actualizado exitosamente:", user.usuario);

    return res.status(200).json({
      success: true,
      message: "Usuario actualizado exitosamente",
      data: {
        _id: user._id,
        usuario: user.usuario,
        rol: user.rol,
        claveRestaurante: user.claveRestaurante,
        nombreContacto: user.nombreContacto,
        correoContacto: user.correoContacto,
        telefonoContacto: user.telefonoContacto,
      },
    });
  } catch (error) {
    console.error("Error al actualizar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar usuario
exports.deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    console.log("Eliminando usuario:", userId);

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // No permitir eliminar administradores
    if (user.rol === "Administrador") {
      return res.status(403).json({
        success: false,
        message: "No se puede eliminar un administrador",
      });
    }

    await User.findByIdAndDelete(userId);

    console.log("Usuario eliminado exitosamente");

    return res.status(200).json({
      success: true,
      message: "Usuario eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
