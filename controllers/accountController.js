const Account = require("../models/Account");
const Product = require("../models/Product");
const Table = require("../models/Table");
const Movement = require("../models/Movement");

// Obtener todas las cuentas abiertas y finalizadas de un restaurante
exports.getOpenAccounts = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;
    console.log("[getOpenAccounts] Buscando cuentas para restaurante:", claveRestaurante);

    const accounts = await Account.find({
      claveRestaurante,
      estado: { $in: ["abierta", "finalizada"] },
    }).sort({ fechaApertura: -1 });

    console.log("[getOpenAccounts] Cuentas encontradas:", accounts.length);

    return res.status(200).json({
      success: true,
      data: accounts,
    });
  } catch (error) {
    console.error("[getOpenAccounts] Error al obtener cuentas:", error);
    console.error("[getOpenAccounts] Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear nueva cuenta
exports.createAccount = async (req, res) => {
  try {
    const { numeroMesa, nombrePersonalizado, mesero, claveRestaurante } = req.body;

    if (!numeroMesa || !mesero || !claveRestaurante) {
      return res.status(400).json({
        success: false,
        message: "numeroMesa, mesero y claveRestaurante son requeridos",
      });
    }

    // Verificar que no haya cuenta abierta en esa mesa
    const existingAccount = await Account.findOne({
      "mesa.numeroMesa": numeroMesa,
      claveRestaurante,
      estado: "abierta",
    });

    if (existingAccount) {
      return res.status(400).json({
        success: false,
        message: "Ya existe una cuenta abierta en esta mesa",
      });
    }

    // Generar número de ticket
    const lastAccount = await Account.findOne({ claveRestaurante }).sort({ numeroTicket: -1 });
    const numeroTicket = lastAccount ? lastAccount.numeroTicket + 1 : 1;

    // Marcar mesa como activa
    await Table.findOneAndUpdate(
      { numeroMesa, claveRestaurante },
      { activa: true }
    );

    const newAccount = new Account({
      numeroTicket,
      mesa: {
        numeroMesa,
        nombrePersonalizado: nombrePersonalizado || "",
      },
      mesero,
      claveRestaurante,
    });

    await newAccount.save();

    return res.status(201).json({
      success: true,
      message: "Cuenta creada exitosamente",
      data: newAccount,
    });
  } catch (error) {
    console.error("Error al crear cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Agregar items a una cuenta (sin comandar)
exports.addItemsToAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { items } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items es requerido y debe ser un array",
      });
    }

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    if (account.estado !== "abierta") {
      return res.status(400).json({
        success: false,
        message: "La cuenta no está abierta",
      });
    }

    // Agregar items sin comandar
    account.items.push(...items);
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Items agregados exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al agregar items:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Comandar items (enviar a cocina)
exports.sendToKitchen = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { itemIds } = req.body;

    if (!itemIds || !Array.isArray(itemIds) || itemIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "itemIds es requerido",
      });
    }

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    // Marcar items como comandados y descontar stock
    for (const itemId of itemIds) {
      const item = account.items.id(itemId);
      if (item && !item.comandado) {
        item.comandado = true;
        item.fechaComandado = new Date();

        // Descontar stock del producto
        await Product.findByIdAndUpdate(
          item.productoId,
          { $inc: { stockDisponible: -item.cantidad } }
        );
      }
    }

    // Calcular subtotal
    account.subtotal = account.items
      .filter(item => item.comandado)
      .reduce((sum, item) => sum + item.precioTotal * item.cantidad, 0);

    await account.save();

    return res.status(200).json({
      success: true,
      message: "Items comandados exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al comandar items:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar item de cuenta (solo no comandados)
exports.removeItem = async (req, res) => {
  try {
    const { accountId, itemId } = req.params;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    const item = account.items.id(itemId);

    if (!item) {
      return res.status(404).json({
        success: false,
        message: "Item no encontrado",
      });
    }

    if (item.comandado) {
      return res.status(400).json({
        success: false,
        message: "No se puede eliminar un item ya comandado",
      });
    }

    item.deleteOne();
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Item eliminado exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al eliminar item:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Finalizar cuenta (antes de cerrar, para imprimir ticket)
exports.finalizeAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    if (account.estado !== "abierta") {
      return res.status(400).json({
        success: false,
        message: "La cuenta no está abierta",
      });
    }

    account.estado = "finalizada";
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Cuenta finalizada exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al finalizar cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Reabrir cuenta finalizada
exports.reopenAccount = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    if (account.estado !== "finalizada") {
      return res.status(400).json({
        success: false,
        message: "Solo se pueden reabrir cuentas finalizadas",
      });
    }

    account.estado = "abierta";
    await account.save();

    return res.status(200).json({
      success: true,
      message: "Cuenta reabierta exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al reabrir cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Cerrar cuenta (después de finalizar y pagar)
exports.closeAccount = async (req, res) => {
  try {
    const { accountId } = req.params;
    const { metodoPago, totalPagado } = req.body;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    if (account.estado !== "finalizada") {
      return res.status(400).json({
        success: false,
        message: "La cuenta debe estar finalizada antes de cerrar",
      });
    }

    account.estado = "cerrada";
    account.metodoPago = metodoPago;
    account.totalPagado = totalPagado;
    account.fechaCierre = new Date();

    // Liberar mesa
    await Table.findOneAndUpdate(
      { numeroMesa: account.mesa.numeroMesa, claveRestaurante: account.claveRestaurante },
      { activa: false }
    );

    await account.save();

    // No crear movimiento automático - las ventas se muestran directamente desde las cuentas cerradas
    // Esto evita la duplicación en el reporte de caja

    return res.status(200).json({
      success: true,
      message: "Cuenta cerrada exitosamente",
      data: account,
    });
  } catch (error) {
    console.error("Error al cerrar cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Obtener detalle de una cuenta
exports.getAccountDetail = async (req, res) => {
  try {
    const { accountId } = req.params;

    const account = await Account.findById(accountId);

    if (!account) {
      return res.status(404).json({
        success: false,
        message: "Cuenta no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: account,
    });
  } catch (error) {
    console.error("Error al obtener cuenta:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
