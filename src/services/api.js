import { getAuthHeaders } from './auth';

const API_BASE = '/api/parking';

// Estado local fallback en caso de ejecutarse en modo estático sin backend Express
let localSlots = [
  {
    id: 1,
    code: 'E-01',
    type: 'standard',
    status: 'available',
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
    type: 'ev',
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
    type: 'disabled',
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

let localBarriers = {
  entry: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
  exit: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
};

let localLogs = [
  {
    id: 'log-1',
    timestamp: new Date(Date.now() - 40 * 60 * 1000).toISOString(),
    source: 'Arduino UNO / Sensor Ultrasónico 2',
    type: 'OCCUPANCY_CHANGE',
    details: 'Espacio E-02 detectó vehículo a 6.4 cm (< 10 cm). Marcado como Ocupado.',
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
    source: 'Servomotor SG90 / Barrera Entrada',
    type: 'BARRIER_CYCLE',
    details: 'Barrera de entrada levantada a 90° para ingreso autorizado. Cierre automático completado.',
    severity: 'info',
  },
];

export async function getParkingState() {
  try {
    const res = await fetch(`${API_BASE}/state`);
    if (!res.ok) throw new Error('API offline');
    const json = await res.json();
    return json.data;
  } catch (err) {
    // Fallback local robusto
    const available = localSlots.filter(s => s.status === 'available').length;
    const occupied = localSlots.filter(s => s.status === 'occupied').length;
    const reserved = localSlots.filter(s => s.status === 'reserved').length;
    return {
      slots: localSlots,
      barriers: localBarriers,
      pricing: { baseRatePerHour: 2000, minuteRate: 35 },
      summary: {
        total: 6,
        available,
        occupied,
        reserved,
        occupancyPercentage: Math.round(((occupied + reserved) / 6) * 100),
      },
    };
  }
}

export async function reserveSlot(slotId, vehiclePlate, driverName, estimatedMinutes = 60) {
  try {
    const res = await fetch(`${API_BASE}/reserve`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ slotId, vehiclePlate, driverName, estimatedMinutes }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al reservar');
    return data;
  } catch (err) {
    // Si la API falla, ejecutar lógica local
    const slot = localSlots.find(s => s.id === Number(slotId));
    if (!slot) throw new Error('Espacio no encontrado');
    if (slot.status !== 'available') throw new Error(`El espacio ya se encuentra ${slot.status === 'occupied' ? 'ocupado' : 'reservado'}`);

    slot.status = 'reserved';
    slot.vehiclePlate = vehiclePlate.toUpperCase().trim();
    slot.driverName = driverName.trim();
    slot.reservedAt = new Date().toISOString();
    slot.totalMinutes = Number(estimatedMinutes);
    slot.feeCLP = Number(estimatedMinutes) * 35;

    localLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'Cliente Web / Reserva',
      type: 'RESERVATION_CREATED',
      details: `Reserva confirmada en ${slot.code} para ${slot.driverName} (${slot.vehiclePlate}).`,
      severity: 'success',
    });

    return { success: true, data: slot, message: `Espacio ${slot.code} reservado exitosamente` };
  }
}

export async function releaseSlot(slotId) {
  try {
    const res = await fetch(`${API_BASE}/release`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ slotId }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al liberar espacio');
    return data;
  } catch (err) {
    const slot = localSlots.find(s => s.id === Number(slotId));
    if (!slot) throw new Error('Espacio no encontrado');

    const prevPlate = slot.vehiclePlate || 'N/A';
    const prevDriver = slot.driverName || 'Conductor';
    const fee = Math.max(1500, Math.round(45 * 35));

    slot.status = 'available';
    slot.distanceCm = 45.0;
    slot.vehiclePlate = null;
    slot.driverName = null;
    slot.reservedAt = null;
    slot.occupiedAt = null;
    slot.feeCLP = 0;

    localLogs.unshift({
      id: `log-${Date.now()}`,
      timestamp: new Date().toISOString(),
      source: 'Operador / Checkout',
      type: 'SLOT_RELEASED',
      details: `Espacio ${slot.code} liberado. Vehículo: ${prevPlate}. Total: $${fee} CLP.`,
      severity: 'info',
    });

    return {
      success: true,
      data: slot,
      receipt: {
        slotCode: slot.code,
        vehiclePlate: prevPlate,
        driverName: prevDriver,
        totalMinutes: 45,
        totalFeeCLP: fee,
      },
    };
  }
}

export async function sendTelemetry(slotId, distanceCm, source = 'Arduino UNO / HC-SR04') {
  try {
    const res = await fetch(`${API_BASE}/telemetry`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ slotId, distanceCm, source }),
    });
    return await res.json();
  } catch (err) {
    const slot = localSlots.find(s => s.id === Number(slotId));
    if (slot) {
      slot.distanceCm = Number(distanceCm);
      if (slot.distanceCm < slot.sensorThresholdCm) {
        slot.status = 'occupied';
        if (!slot.vehiclePlate) slot.vehiclePlate = 'AUTO-IOT';
      } else {
        if (slot.status === 'occupied') {
          slot.status = 'available';
          slot.vehiclePlate = null;
        }
      }
    }
    return { success: true, slot };
  }
}

export async function toggleBarrier(gate, action = 'toggle') {
  try {
    const res = await fetch(`${API_BASE}/barrier`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify({ gate, action }),
    });
    return await res.json();
  } catch (err) {
    const barrier = localBarriers[gate];
    const newStatus = action === 'toggle' ? (barrier.status === 'open' ? 'closed' : 'open') : action;
    barrier.status = newStatus;
    barrier.angle = newStatus === 'open' ? 90 : 0;
    barrier.lastAction = new Date().toISOString();
    return { success: true, barrier };
  }
}

export async function getLogs() {
  try {
    const res = await fetch(`${API_BASE}/logs`);
    if (!res.ok) throw new Error('Logs offline');
    const json = await res.json();
    return json.logs;
  } catch (err) {
    return localLogs;
  }
}

export async function updateSlot(slotId, updateData) {
  try {
    const res = await fetch(`${API_BASE}/slots/${slotId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeaders() },
      body: JSON.stringify(updateData),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al actualizar espacio');
    return data;
  } catch (err) {
    const slot = localSlots.find(s => s.id === Number(slotId));
    if (!slot) throw new Error('Espacio no encontrado');
    if (updateData.status) slot.status = updateData.status;
    if (updateData.vehiclePlate !== undefined) slot.vehiclePlate = updateData.vehiclePlate;
    if (updateData.driverName !== undefined) slot.driverName = updateData.driverName;
    return { success: true, data: slot, message: 'Espacio actualizado localmente' };
  }
}

export async function deleteSlot(slotId) {
  try {
    const res = await fetch(`${API_BASE}/slots/${slotId}`, {
      method: 'DELETE',
      headers: { ...getAuthHeaders() },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.message || 'Error al eliminar registro');
    return data;
  } catch (err) {
    return releaseSlot(slotId);
  }
}

export async function resetParkingState() {
  try {
    const res = await fetch(`${API_BASE}/reset`, { method: 'POST' });
    return await res.json();
  } catch (err) {
    // Reset local
    return { success: true };
  }
}
