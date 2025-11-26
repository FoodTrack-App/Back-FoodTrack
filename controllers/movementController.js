const Movement = require("../models/Movement");
const Account = require("../models/Account");

// Obtener movimientos por restaurante y fecha
exports.getMovementsByDate = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;
    const { fecha } = req.query; // formato: YYYY-MM-DD

    if (!fecha) {
      return res.status(400).json({
        success: false,
        message: "Fecha es requerida",
      });
    }

    // Buscar todos los movimientos del restaurante
    const allMovements = await Movement.find({
      claveRestaurante,
    }).sort({ fecha: -1 });

    // Filtrar movimientos por fecha
    const movements = allMovements.filter((m) => {
      const movDate = new Date(m.fecha);
      const movDateStr = movDate.toISOString().split('T')[0];
      return movDateStr === fecha;
    });

    // Buscar cuentas cerradas del día para mostrarlas como movimientos
    const allAccounts = await Account.find({
      claveRestaurante,
      estado: "cerrada",
    });

    // Filtrar cuentas cerradas por fecha
    const closedAccountsToday = allAccounts.filter((acc) => {
      if (!acc.fechaCierre) return false;
      const accDate = new Date(acc.fechaCierre);
      const accDateStr = accDate.toISOString().split('T')[0];
      return accDateStr === fecha;
    });

    // Convertir cuentas cerradas a formato de movimiento
    const accountMovements = closedAccountsToday.map((acc) => ({
      _id: acc._id,
      tipo: "ingreso",
      descripcion: `Venta - Ticket #${acc.numeroTicket} - ${acc.mesa.nombrePersonalizado || 'Mesa ' + acc.mesa.numeroMesa}`,
      monto: acc.subtotal,
      metodoPago: acc.metodoPago,
      fecha: acc.fechaCierre,
      cuentaId: acc._id,
      esVenta: true,
    }));

    // Combinar movimientos manuales y ventas, ordenar por fecha
    const allMovementsCombined = [...movements, ...accountMovements].sort((a, b) => 
      new Date(b.fecha) - new Date(a.fecha)
    );

    return res.status(200).json({
      success: true,
      movements: allMovementsCombined,
    });
  } catch (error) {
    console.error("Error al obtener movimientos:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Obtener resumen de caja (totales generales sin filtro de fecha)
exports.getCashSummary = async (req, res) => {
  try {
    const { claveRestaurante } = req.params;

    // Obtener TODOS los movimientos del restaurante (sin filtro de fecha)
    const movements = await Movement.find({
      claveRestaurante,
    });

    // Obtener TODAS las cuentas cerradas del restaurante (sin filtro de fecha)
    const closedAccounts = await Account.find({
      claveRestaurante,
      estado: "cerrada",
    });

    // Separar movimientos de ventas (tienen cuentaId) de movimientos manuales
    const movimientosVentas = movements.filter((m) => m.cuentaId && m.tipo === "ingreso");
    const movimientosManualIngresos = movements.filter((m) => !m.cuentaId && m.tipo === "ingreso");
    const movimientosEgresos = movements.filter((m) => m.tipo === "egreso");

    // Calcular totales de ventas desde cuentas cerradas
    const ventasDelDia = closedAccounts.reduce((sum, acc) => sum + acc.subtotal, 0);
    const ingresosManuales = movimientosManualIngresos.reduce((sum, m) => sum + m.monto, 0);
    const egresos = movimientosEgresos.reduce((sum, m) => sum + m.monto, 0);

    return res.status(200).json({
      success: true,
      ingresos: ingresosManuales,
      egresos,
      ventasDelDia,
      balance: ventasDelDia + ingresosManuales - egresos,
      countIngresos: movimientosManualIngresos.length + closedAccounts.length,
      countEgresos: movimientosEgresos.length,
    });
  } catch (error) {
    console.error("Error al obtener resumen:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Crear nuevo movimiento
exports.createMovement = async (req, res) => {
  try {
    const { claveRestaurante, tipo, descripcion, monto, metodoPago, cuentaId } = req.body;

    if (!claveRestaurante || !tipo || !descripcion || monto === undefined) {
      return res.status(400).json({
        success: false,
        message: "claveRestaurante, tipo, descripcion y monto son requeridos",
      });
    }

    if (!["ingreso", "egreso"].includes(tipo)) {
      return res.status(400).json({
        success: false,
        message: "tipo debe ser 'ingreso' o 'egreso'",
      });
    }

    const newMovement = new Movement({
      claveRestaurante,
      tipo,
      descripcion,
      monto: Math.abs(monto), // Siempre positivo, el tipo indica si es ingreso o egreso
      metodoPago: metodoPago || "efectivo",
      cuentaId: cuentaId || undefined,
    });

    await newMovement.save();

    return res.status(201).json({
      success: true,
      message: "Movimiento creado exitosamente",
      movement: newMovement,
    });
  } catch (error) {
    console.error("Error al crear movimiento:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};

// Eliminar movimiento
exports.deleteMovement = async (req, res) => {
  try {
    const { movementId } = req.params;

    const movement = await Movement.findByIdAndDelete(movementId);

    if (!movement) {
      return res.status(404).json({
        success: false,
        message: "Movimiento no encontrado",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Movimiento eliminado exitosamente",
    });
  } catch (error) {
    console.error("Error al eliminar movimiento:", error);
    return res.status(500).json({
      success: false,
      message: "Error del servidor",
      error: error.message,
    });
  }
};
