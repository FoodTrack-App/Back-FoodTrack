const User = require("../models/User");

// Obtener información del usuario
exports.getUserProfile = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId).select("-contraseña");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error al obtener perfil:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar información de contacto
exports.updateContactInfo = async (req, res) => {
  try {
    const { userId } = req.params;
    const { nombreContacto, correoContacto, telefonoContacto } = req.body;
    
    console.log("Actualizando contacto para userId:", userId);
    console.log("Datos recibidos:", { nombreContacto, correoContacto, telefonoContacto });

    const user = await User.findByIdAndUpdate(
      userId,
      {
        nombreContacto,
        correoContacto,
        telefonoContacto,
      },
      { new: true, runValidators: true }
    ).select("-contraseña");

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Información actualizada correctamente",
      data: user,
    });
  } catch (error) {
    console.error("Error al actualizar información:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Cambiar contraseña
exports.changePassword = async (req, res) => {
  try {
    const { userId } = req.params;
    const { currentPassword, newPassword } = req.body;
    
    console.log("Cambiando contraseña para userId:", userId);

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Se requiere la contraseña actual y la nueva",
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        success: false,
        message: "La nueva contraseña debe tener al menos 8 caracteres",
      });
    }

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "Usuario no encontrado",
      });
    }

    // Verificar contraseña actual
    if (user.contraseña !== currentPassword) {
      return res.status(401).json({
        success: false,
        message: "La contraseña actual es incorrecta",
      });
    }

    // Actualizar contraseña
    user.contraseña = newPassword;
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Contraseña actualizada correctamente",
    });
  } catch (error) {
    console.error("Error al cambiar contraseña:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
