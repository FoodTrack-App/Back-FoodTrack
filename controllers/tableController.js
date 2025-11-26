const Table = require("../models/Table");

// Obtener todas las mesas de un restaurante
exports.getTables = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;
    console.log("[getTables] Buscando mesas para restaurante:", claveRestaurante);

    const tables = await Table.find({ claveRestaurante }).sort({ numeroMesa: 1 });
    console.log("[getTables] Mesas encontradas:", tables.length);

    return res.status(200).json({
      success: true,
      data: tables,
    });
  } catch (error) {
    console.error("[getTables] Error al obtener mesas:", error);
    console.error("[getTables] Stack:", error.stack);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear/actualizar configuración de mesas
exports.configureTables = async (req, res) => {
  try {
    const { claveRestaurante, totalMesas } = req.body;

    if (!claveRestaurante || !totalMesas) {
      return res.status(400).json({
        success: false,
        message: "claveRestaurante y totalMesas son requeridos",
      });
    }

    // Crear mesas que no existen
    const existingTables = await Table.find({ claveRestaurante });
    const existingNumbers = existingTables.map(t => t.numeroMesa);

    for (let i = 1; i <= totalMesas; i++) {
      if (!existingNumbers.includes(i)) {
        await Table.create({
          numeroMesa: i,
          claveRestaurante,
        });
      }
    }

    // Eliminar mesas que sobran
    await Table.deleteMany({
      claveRestaurante,
      numeroMesa: { $gt: totalMesas },
    });

    const tables = await Table.find({ claveRestaurante }).sort({ numeroMesa: 1 });

    return res.status(200).json({
      success: true,
      message: "Mesas configuradas exitosamente",
      data: tables,
    });
  } catch (error) {
    console.error("Error al configurar mesas:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Actualizar nombre personalizado de mesa
exports.updateTableName = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { nombrePersonalizado } = req.body;

    const table = await Table.findByIdAndUpdate(
      tableId,
      { nombrePersonalizado },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Mesa no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Error al actualizar mesa:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Activar/desactivar mesa
exports.toggleTableStatus = async (req, res) => {
  try {
    const { tableId } = req.params;
    const { activa } = req.body;

    const table = await Table.findByIdAndUpdate(
      tableId,
      { activa },
      { new: true }
    );

    if (!table) {
      return res.status(404).json({
        success: false,
        message: "Mesa no encontrada",
      });
    }

    return res.status(200).json({
      success: true,
      data: table,
    });
  } catch (error) {
    console.error("Error al actualizar estado de mesa:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
