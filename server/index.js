import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-Memory Data Store (Simulates Azure Cosmos DB / SQL Database Repository)
// Aligned with the Layered Architecture: Controller -> Service -> Repository
const INITIAL_SLOTS = [
  {
    id: 1,
    code: 'E-01',
    type: 'standard',
    status: 'available', // 'available' | 'reserved' | 'occupied'
    distanceCm: 45.2,
    sensorThresholdCm: 10.0,
    vehiclePlate: null,
    driverName: null,
    reservedAt: null,
    occupiedAt: null,
    totalMinutes: 0,
    feeCLP: 0,
  },
  {
    id: 2,
    code: 'E-02',
    type: 'ev', // Carga eléctrica
    status: 'occupied',
    distanceCm: 6.4,
    sensorThresholdCm: 10.0,
    vehiclePlate: 'KJ-8921',
    driverName: 'Valentina Soto',
    reservedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
    occupiedAt: new Date(Date.now() - 38 * 60 * 1000).toISOString(),
    totalMinutes: 38,
    feeCLP: 1900,
  },
  {
    id: 3,
    code: 'E-03',
    type: 'standard',
    status: 'available',
    distanceCm: 50.0,
    sensorThresholdCm: 10.0,
    vehiclePlate: null,
    driverName: null,
    reservedAt: null,
    occupiedAt: null,
    totalMinutes: 0,
    feeCLP: 0,
  },
  {
    id: 4,
    code: 'E-04',
    type: 'disabled', // Preferencial
    status: 'reserved',
    distanceCm: 48.1,
    sensorThresholdCm: 10.0,
    vehiclePlate: 'LX-4402',
    driverName: 'Carlos Mella',
    reservedAt: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
    occupiedAt: null,
    totalMinutes: 0,
    feeCLP: 0,
  },
  {
    id: 5,
    code: 'E-05',
    type: 'standard',
    status: 'available',
    distanceCm: 42.8,
    sensorThresholdCm: 10.0,
    vehiclePlate: null,
    driverName: null,
    reservedAt: null,
    occupiedAt: null,
    totalMinutes: 0,
    feeCLP: 0,
  },
  {
    id: 6,
    code: 'E-06',
    type: 'vip',
    status: 'occupied',
    distanceCm: 5.1,
    sensorThresholdCm: 10.0,
    vehiclePlate: 'PR-7731',
    driverName: 'Ignacio Silva',
    reservedAt: new Date(Date.now() - 75 * 60 * 1000).toISOString(),
    occupiedAt: new Date(Date.now() - 70 * 60 * 1000).toISOString(),
    totalMinutes: 70,
    feeCLP: 3500,
  },
];

let parkingState = {
  slots: JSON.parse(JSON.stringify(INITIAL_SLOTS)),
  barriers: {
    entry: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
    exit: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
  },
  totem: {
    message: 'BIENVENIDO AL ESTACIONAMIENTO',
    mode: 'auto',
  },
  hardware: {
    controller: 'Arduino UNO R3 (ATmega328P)',
    baudRate: 9600,
    connected: false,
    lastHeartbeat: new Date().toISOString(),
    sensorsCount: 8, // 6 slots + 1 entrada + 1 salida
    servosCount: 2,
    ledsCount: 12,
  },
  pricing: {
    baseRatePerHour: 2000, // CLP
    minuteRate: 35, // CLP / min
  },
};

let eventLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: 'Sistema de Telemetría / Sensor Cupo 2',
    type: 'OCCUPANCY_CHANGE',
    details: 'Espacio E-02 detectó vehículo presente. Marcado como Ocupado.',
    severity: 'info',
  },
  {
    id: 'log-2',
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    source: 'Azure API REST / App Web',
    type: 'RESERVATION_CREATED',
    details: 'Reserva generada para E-04 (Patente LX-4402 - Carlos Mella).',
    severity: 'success',
  },
  {
    id: 'log-3',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    source: 'Controlador de Acceso / Barrera Entrada',
    type: 'BARRIER_CYCLE',
    details: 'Barrera de entrada levantada a 90° para ingreso autorizado. Cierre automático completado.',
    severity: 'info',
  },
];

function addLog(source, type, details, severity = 'info') {
  const logItem = {
    id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    timestamp: new Date().toISOString(),
    source,
    type,
    details,
    severity,
  };
  eventLogs.unshift(logItem);
  if (eventLogs.length > 50) eventLogs.pop();
}

// --------------------------------------------------------------------------
// REST API ENDPOINTS (Aligned with Azure App Service / Serverless Functions)
// --------------------------------------------------------------------------

// 1. Obtener estado general del estacionamiento
app.get('/api/parking/state', (req, res) => {
  const availableCount = parkingState.slots.filter(s => s.status === 'available').length;
  const occupiedCount = parkingState.slots.filter(s => s.status === 'occupied').length;
  const reservedCount = parkingState.slots.filter(s => s.status === 'reserved').length;

  res.json({
    success: true,
    data: {
      ...parkingState,
      summary: {
        total: parkingState.slots.length,
        available: availableCount,
        occupied: occupiedCount,
        reserved: reservedCount,
        occupancyPercentage: Math.round(((occupiedCount + reservedCount) / parkingState.slots.length) * 100),
      },
    },
    meta: {
      timestamp: new Date().toISOString(),
      azureRegion: 'East US 2 (Azure App Service)',
      layer: 'Presentation & Business Logic API',
    },
  });
});

// 2. Telemetría IoT desde Arduino UNO (o simulador de hardware)
app.post('/api/parking/telemetry', (req, res) => {
  const { slotId, distanceCm, source = 'Arduino UNO / HC-SR04' } = req.body;

  if (slotId === undefined || distanceCm === undefined) {
    return res.status(400).json({ success: false, message: 'slotId y distanceCm son requeridos' });
  }

  const slot = parkingState.slots.find(s => s.id === Number(slotId));
  if (!slot) {
    return res.status(404).json({ success: false, message: `Espacio ${slotId} no encontrado` });
  }

  const previousStatus = slot.status;
  slot.distanceCm = Number(distanceCm);

  // Lógica de detección: distancia < 10 cm significa vehículo presente (según informe de maqueta)
  if (slot.distanceCm < slot.sensorThresholdCm) {
    if (slot.status !== 'occupied') {
      slot.status = 'occupied';
      slot.occupiedAt = new Date().toISOString();
      if (!slot.vehiclePlate) slot.vehiclePlate = 'AUTO-IOT';
      addLog(source, 'SENSOR_TRIGGER', `Sensor E-0${slot.id} detectó vehículo a ${slot.distanceCm}cm (< 10cm). Estado: OCUPADO. LED rojo activado.`, 'warning');
    }
  } else {
    // Si la distancia es >= 10 cm y estaba ocupado, se libera
    if (slot.status === 'occupied') {
      slot.status = 'available';
      slot.occupiedAt = null;
      slot.vehiclePlate = null;
      slot.driverName = null;
      slot.feeCLP = 0;
      addLog(source, 'SENSOR_CLEAR', `Sensor E-0${slot.id} libre (${slot.distanceCm}cm >= 10cm). Estado: LIBRE. LED verde activado.`, 'success');
    }
  }

  res.json({
    success: true,
    slot,
    changed: previousStatus !== slot.status,
    message: `Telemetría recibida para slot ${slot.code}: ${slot.distanceCm} cm -> ${slot.status === 'occupied' ? 'Ocupado' : 'Libre'}`,
  });
});

// 3. Reservar un espacio (Funcionalidad Clave 1)
app.post('/api/parking/reserve', (req, res) => {
  const { slotId, vehiclePlate, driverName, estimatedMinutes = 60 } = req.body;

  if (!slotId || !vehiclePlate || !driverName) {
    return res.status(400).json({ success: false, message: 'Todos los campos son obligatorios: espacio, patente y nombre del conductor.' });
  }

  // Validación de patente formato chileno básico (ej: ABCD-12 o AB-1234 o similar)
  const cleanPlate = vehiclePlate.trim().toUpperCase().replace(/[^A-Z0-9]/g, '');
  if (cleanPlate.length < 5 || cleanPlate.length > 7) {
    return res.status(400).json({ success: false, message: 'Formato de patente inválido (ej: ABCD12 o AB1234).' });
  }

  const slot = parkingState.slots.find(s => s.id === Number(slotId));
  if (!slot) {
    return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
  }

  if (slot.status !== 'available') {
    return res.status(409).json({ success: false, message: `El espacio ${slot.code} no está disponible actualmente (Estado: ${slot.status === 'occupied' ? 'Ocupado' : 'Reservado'}).` });
  }

  slot.status = 'reserved';
  slot.vehiclePlate = cleanPlate;
  slot.driverName = driverName.trim();
  slot.reservedAt = new Date().toISOString();
  slot.totalMinutes = Number(estimatedMinutes);
  slot.feeCLP = Math.round(Number(estimatedMinutes) * parkingState.pricing.minuteRate);

  addLog('Web Client / Sistema de Reserva', 'RESERVATION_CREATED', `Reserva confirmada en ${slot.code} para ${slot.driverName} (${slot.vehiclePlate}). Tarifa estimada: $${slot.feeCLP} CLP.`, 'success');

  res.json({
    success: true,
    data: slot,
    message: `¡Espacio ${slot.code} reservado exitosamente para ${slot.driverName}!`,
  });
});

// 4. Liberar / Check-out de un espacio (Funcionalidad Clave 2)
app.post('/api/parking/release', (req, res) => {
  const { slotId } = req.body;
  const slot = parkingState.slots.find(s => s.id === Number(slotId));

  if (!slot) {
    return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
  }

  if (slot.status === 'available') {
    return res.status(400).json({ success: false, message: 'El espacio ya se encuentra libre.' });
  }

  const prevPlate = slot.vehiclePlate || 'N/A';
  const prevDriver = slot.driverName || 'Conductor';
  
  // Cálculo final de tarifa
  const startTime = slot.occupiedAt || slot.reservedAt || new Date().toISOString();
  const diffMinutes = Math.max(5, Math.round((Date.now() - new Date(startTime).getTime()) / (1000 * 60)));
  const finalFee = Math.round(diffMinutes * parkingState.pricing.minuteRate);

  slot.status = 'available';
  slot.distanceCm = 45.0; // Restablecer distancia de sensor
  slot.vehiclePlate = null;
  slot.driverName = null;
  slot.reservedAt = null;
  slot.occupiedAt = null;
  slot.totalMinutes = 0;
  slot.feeCLP = 0;

  addLog('Operador / Salida Vehicular', 'SLOT_RELEASED', `Espacio ${slot.code} liberado. Vehículo: ${prevPlate} (${prevDriver}). Tiempo: ${diffMinutes} min. Total cobrado: $${finalFee} CLP.`, 'info');

  res.json({
    success: true,
    data: slot,
    receipt: {
      slotCode: slot.code,
      vehiclePlate: prevPlate,
      driverName: prevDriver,
      totalMinutes: diffMinutes,
      totalFeeCLP: finalFee,
      releasedAt: new Date().toISOString(),
    },
    message: `Espacio ${slot.code} liberado correctamente.`,
  });
});

// 4.1 Actualizar registro de un espacio (CRUD: UPDATE)
app.put('/api/parking/slots/:id', (req, res) => {
  const { id } = req.params;
  const { status, vehiclePlate, driverName, type } = req.body;
  const slot = parkingState.slots.find(s => s.id === Number(id));

  if (!slot) {
    return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
  }

  const previousStatus = slot.status;
  if (status !== undefined) slot.status = status;
  if (vehiclePlate !== undefined) slot.vehiclePlate = vehiclePlate ? vehiclePlate.trim().toUpperCase() : null;
  if (driverName !== undefined) slot.driverName = driverName ? driverName.trim() : null;
  if (type !== undefined) slot.type = type;

  if (slot.status === 'occupied') {
    slot.distanceCm = 6.0;
    if (!slot.occupiedAt) slot.occupiedAt = new Date().toISOString();
  } else if (slot.status === 'available') {
    slot.distanceCm = 45.0;
    slot.vehiclePlate = null;
    slot.driverName = null;
    slot.occupiedAt = null;
    slot.reservedAt = null;
    slot.totalMinutes = 0;
    slot.feeCLP = 0;
  } else if (slot.status === 'reserved') {
    slot.distanceCm = 45.0;
    if (!slot.reservedAt) slot.reservedAt = new Date().toISOString();
  }

  addLog('API REST / CRUD Manager', 'SLOT_UPDATED', `Espacio ${slot.code} actualizado. Estado: ${slot.status.toUpperCase()} (Vehículo: ${slot.vehiclePlate || 'N/A'}).`, 'info');

  res.json({
    success: true,
    data: slot,
    message: `Espacio ${slot.code} actualizado exitosamente`,
  });
});

// 4.2 Eliminar / Cancelar registro de espacio (CRUD: DELETE)
app.delete('/api/parking/slots/:id', (req, res) => {
  const { id } = req.params;
  const slot = parkingState.slots.find(s => s.id === Number(id));

  if (!slot) {
    return res.status(404).json({ success: false, message: 'Espacio no encontrado' });
  }

  const prevPlate = slot.vehiclePlate || 'N/A';
  const prevDriver = slot.driverName || 'Conductor';
  
  slot.status = 'available';
  slot.distanceCm = 45.0;
  slot.vehiclePlate = null;
  slot.driverName = null;
  slot.reservedAt = null;
  slot.occupiedAt = null;
  slot.totalMinutes = 0;
  slot.feeCLP = 0;

  addLog('API REST / CRUD Manager', 'SLOT_DELETED', `Registro de espacio ${slot.code} eliminado. Vehículo anterior: ${prevPlate} (${prevDriver}). Espacio libre.`, 'warning');

  res.json({
    success: true,
    data: slot,
    message: `Registro de espacio ${slot.code} eliminado exitosamente.`,
  });
});

// 5. Control de barreras (Entrada / Salida - Servomotores SG90)
app.post('/api/parking/barrier', (req, res) => {
  const { gate, action } = req.body; // gate: 'entry' | 'exit', action: 'open' | 'close' | 'toggle'

  if (!['entry', 'exit'].includes(gate)) {
    return res.status(400).json({ success: false, message: "Parámetro 'gate' debe ser 'entry' o 'exit'" });
  }

  const barrier = parkingState.barriers[gate];
  const newStatus = action === 'toggle' ? (barrier.status === 'open' ? 'closed' : 'open') : action;
  
  barrier.status = newStatus;
  barrier.angle = newStatus === 'open' ? 90 : 0;
  barrier.lastAction = new Date().toISOString();

  addLog(
    `Servomotor SG90 / Barrera ${gate === 'entry' ? 'Entrada' : 'Salida'}`,
    'BARRIER_COMMAND',
    `Comando barrera ${gate.toUpperCase()}: ${newStatus.toUpperCase()} (Ángulo servo: ${barrier.angle}°).`,
    'info'
  );

  res.json({
    success: true,
    barrier: {
      gate,
      status: barrier.status,
      angle: barrier.angle,
      lastAction: barrier.lastAction,
    },
    message: `Barrera de ${gate === 'entry' ? 'Entrada' : 'Salida'} ${newStatus === 'open' ? 'abierta a 90°' : 'cerrada a 0°'}`,
  });
});

// 6. Registro de Logs y Auditoría para Demostración
app.get('/api/parking/logs', (req, res) => {
  res.json({
    success: true,
    logs: eventLogs,
  });
});

// 7. Analíticas de Negocio y Ocupación
app.get('/api/parking/analytics', (req, res) => {
  res.json({
    success: true,
    analytics: {
      occupancyRate: 50,
      totalVehiclesToday: 42,
      averageStayMinutes: 48,
      estimatedRevenueTodayCLP: 68400,
      peakHours: [
        { hour: '08:00', occupancy: 40 },
        { hour: '10:00', occupancy: 70 },
        { hour: '12:00', occupancy: 95 },
        { hour: '14:00', occupancy: 80 },
        { hour: '16:00', occupancy: 60 },
        { hour: '18:00', occupancy: 100 },
        { hour: '20:00', occupancy: 50 },
      ],
      distributionByType: {
        standard: 4,
        ev: 1,
        disabled: 1,
      },
    },
  });
});

// 8. Reset a estado inicial para demostración
app.post('/api/parking/reset', (req, res) => {
  parkingState.slots = JSON.parse(JSON.stringify(INITIAL_SLOTS));
  parkingState.barriers.entry.status = 'closed';
  parkingState.barriers.entry.angle = 0;
  parkingState.barriers.exit.status = 'closed';
  parkingState.barriers.exit.angle = 0;
  addLog('Sistema', 'RESET', 'Estado del estacionamiento reiniciado a configuración de fábrica.', 'warning');

  res.json({
    success: true,
    message: 'Sistema reiniciado exitosamente',
    data: parkingState,
  });
});

// Servir frontend compilado en producción (dist)
const distPath = path.join(__dirname, '..', 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({ error: 'Endpoint no encontrado' });
  }
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`[Smart Parking API] Servidor activo en http://localhost:${PORT}`);
  console.log(`[Azure Cloud Ready] Modo: ${process.env.NODE_ENV || 'development'}`);
});
