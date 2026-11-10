import { initializeApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  onSnapshot, 
  addDoc,
  serverTimestamp, 
  query, 
  orderBy, 
  limit 
} from 'firebase/firestore';

// Credenciales oficiales Firebase del proyecto iotAURA
export const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDIiTaUsJHMPBjvXUqjpoCJ5VNauFoOakA",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "iotaura.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "iotaura",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "iotaura.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "345175771836",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:345175771836:web:1ea68d8f33baccf917deb9",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-YW45RS52SR"
};

// Inicializar Firebase App y Cloud Firestore
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Nombres de colecciones y documentos en Firestore
export const SLOTS_COLLECTION = 'parking_slots';
export const RESERVATIONS_COLLECTION = 'reservations';
export const LOGS_COLLECTION = 'audit_logs';
export const SYSTEM_COLLECTION = 'system_state';
export const BARRIERS_DOC_ID = 'barriers';

// Estado base de los 6 cupos del estacionamiento
export const DEFAULT_SLOTS = [
  { id: 1, code: 'E-01', type: 'standard', status: 'available', distanceCm: 45.0, vehiclePlate: null, driverName: null, totalMinutes: 0, feeCLP: 0 },
  { id: 2, code: 'E-02', type: 'ev', status: 'occupied', distanceCm: 6.4, vehiclePlate: 'KJ-8921', driverName: 'Valentina Soto', totalMinutes: 38, feeCLP: 1900 },
  { id: 3, code: 'E-03', type: 'standard', status: 'available', distanceCm: 50.0, vehiclePlate: null, driverName: null, totalMinutes: 0, feeCLP: 0 },
  { id: 4, code: 'E-04', type: 'disabled', status: 'reserved', distanceCm: 48.0, vehiclePlate: 'LX-4402', driverName: 'Carlos Mella', totalMinutes: 0, feeCLP: 0 },
  { id: 5, code: 'E-05', type: 'standard', status: 'available', distanceCm: 42.0, vehiclePlate: null, driverName: null, totalMinutes: 0, feeCLP: 0 },
  { id: 6, code: 'E-06', type: 'vip', status: 'occupied', distanceCm: 5.1, vehiclePlate: 'PR-7731', driverName: 'Ignacio Silva', totalMinutes: 70, feeCLP: 3500 },
];

export const DEFAULT_BARRIERS = {
  entry: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
  exit: { status: 'closed', angle: 0, lastAction: new Date().toISOString() },
};

/**
 * Sembrar los 6 cupos iniciales en Firestore si la colección está vacía
 */
export async function seedInitialSlotsIfEmpty() {
  try {
    const slotsCol = collection(db, SLOTS_COLLECTION);
    const snapshot = await getDocs(slotsCol);
    if (snapshot.empty) {
      console.log('[Firestore] Inicializando 6 cupos en iotAURA.parking_slots...');
      for (const slot of DEFAULT_SLOTS) {
        await setDoc(doc(db, SLOTS_COLLECTION, String(slot.id)), {
          ...slot,
          updatedAt: serverTimestamp(),
        });
      }
      console.log('[Firestore] Cupos creados exitosamente en Firebase.');
    }
  } catch (error) {
    console.warn('[Firestore] Error al inicializar cupos:', error.message);
  }
}

/**
 * Inicializar estado de las barreras en Firestore si no existe
 */
export async function seedInitialBarriersIfEmpty() {
  try {
    const barrierDocRef = doc(db, SYSTEM_COLLECTION, BARRIERS_DOC_ID);
    const docSnap = await getDoc(barrierDocRef);
    if (!docSnap.exists()) {
      await setDoc(barrierDocRef, {
        ...DEFAULT_BARRIERS,
        updatedAt: serverTimestamp(),
      });
      console.log('[Firestore] Barreras inicializadas en Firebase.');
    }
  } catch (error) {
    console.warn('[Firestore] Error al inicializar barreras:', error.message);
  }
}

/**
 * Escuchar cambios en tiempo real de los cupos en Firestore
 */
export function subscribeToParkingSlots(callback) {
  try {
    const slotsCol = collection(db, SLOTS_COLLECTION);
    return onSnapshot(slotsCol, (snapshot) => {
      if (!snapshot.empty) {
        const slots = [];
        snapshot.forEach((docItem) => {
          slots.push({ ...docItem.data(), id: Number(docItem.id) });
        });
        slots.sort((a, b) => a.id - b.id);
        callback(slots);
      }
    }, (error) => {
      console.warn('[Firestore onSnapshot error]:', error.message);
    });
  } catch (error) {
    console.warn('[Firestore subscription error]:', error.message);
    return () => {};
  }
}

/**
 * Escuchar cambios en tiempo real de las barreras en Firestore
 */
export function subscribeToBarriers(callback) {
  try {
    const barrierDocRef = doc(db, SYSTEM_COLLECTION, BARRIERS_DOC_ID);
    return onSnapshot(barrierDocRef, (docSnap) => {
      if (docSnap.exists()) {
        callback(docSnap.data());
      }
    }, (error) => {
      console.warn('[Firestore barriers onSnapshot error]:', error.message);
    });
  } catch (error) {
    console.warn('[Firestore barriers subscription error]:', error.message);
    return () => {};
  }
}

/**
 * Actualizar el estado de una barrera (Entrada / Salida) en Firestore
 */
export async function updateBarrierInFirestore(gate, status, angle = null) {
  try {
    const calculatedAngle = angle !== null ? angle : (status === 'open' ? 90 : 0);
    const barrierDocRef = doc(db, SYSTEM_COLLECTION, BARRIERS_DOC_ID);

    await setDoc(barrierDocRef, {
      [gate]: {
        status,
        angle: calculatedAngle,
        lastAction: new Date().toISOString(),
      },
      updatedAt: serverTimestamp(),
    }, { merge: true });

    await addAuditLogInFirestore(
      `Control Remoto / Barrera ${gate === 'entry' ? 'Entrada' : 'Salida'}`,
      'BARRIER_COMMAND',
      `Barrera ${gate === 'entry' ? 'Entrada' : 'Salida'} ${status === 'open' ? 'ABIERTA a 90°' : 'CERRADA a 0°'} vía Web/IoT.`,
      status === 'open' ? 'info' : 'warning'
    );

    return {
      gate,
      status,
      angle: calculatedAngle,
      lastAction: new Date().toISOString(),
    };
  } catch (err) {
    console.warn('[Firestore updateBarrier error]:', err.message);
    throw err;
  }
}

/**
 * Escuchar cambios en tiempo real de los logs de auditoría
 */
export function subscribeToAuditLogs(callback) {
  try {
    const logsCol = collection(db, LOGS_COLLECTION);
    const q = query(logsCol, orderBy('createdAt', 'desc'), limit(30));
    return onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach(docItem => {
        logs.push({ id: docItem.id, ...docItem.data() });
      });
      callback(logs);
    }, (error) => {
      console.warn('[Firestore logs onSnapshot error]:', error.message);
    });
  } catch (error) {
    console.warn('[Firestore logs subscription error]:', error.message);
    return () => {};
  }
}

/**
 * Registrar log en Firestore
 */
export async function addAuditLogInFirestore(source, type, details, severity = 'info') {
  try {
    await addDoc(collection(db, LOGS_COLLECTION), {
      source,
      type,
      details,
      severity,
      createdAt: serverTimestamp(),
      timestampStr: new Date().toLocaleTimeString('es-CL'),
    });
  } catch (err) {
    console.warn('[Firestore addLog error]:', err.message);
  }
}

/**
 * Actualizar datos de un espacio (CRUD: UPDATE)
 */
export async function updateSlotInFirestore(slotId, updateData) {
  const slotRef = doc(db, SLOTS_COLLECTION, String(slotId));
  
  const payload = { ...updateData, updatedAt: serverTimestamp() };
  if (updateData.status === 'occupied') {
    payload.distanceCm = updateData.distanceCm || 6.0;
    if (!payload.occupiedAt) payload.occupiedAt = new Date().toISOString();
  } else if (updateData.status === 'available') {
    payload.distanceCm = updateData.distanceCm || 45.0;
    payload.vehiclePlate = null;
    payload.driverName = null;
    payload.totalMinutes = 0;
    payload.feeCLP = 0;
    payload.occupiedAt = null;
    payload.reservedAt = null;
  } else if (updateData.status === 'reserved') {
    payload.distanceCm = updateData.distanceCm || 45.0;
    if (!payload.reservedAt) payload.reservedAt = new Date().toISOString();
  }

  await updateDoc(slotRef, payload);
  await addAuditLogInFirestore(
    'Firestore / CRUD Update',
    'SLOT_UPDATED',
    `Espacio E-0${slotId} modificado: ${updateData.status || 'estado actualizado'}.`,
    'info'
  );
}

/**
 * Telemetría directa desde sensor Arduino HC-SR04 hacia Firestore
 */
export async function updateTelemetryInFirestore(slotId, distanceCm, source = 'Arduino UNO / HC-SR04') {
  const slotRef = doc(db, SLOTS_COLLECTION, String(slotId));
  const numDist = Number(distanceCm);
  const isOccupied = numDist < 10.0;

  const updateData = {
    distanceCm: numDist,
    updatedAt: serverTimestamp(),
  };

  if (isOccupied) {
    updateData.status = 'occupied';
    updateData.occupiedAt = new Date().toISOString();
    updateData.vehiclePlate = 'AUTO-IOT';
    updateData.driverName = 'Sensor Maqueta';
  } else {
    updateData.status = 'available';
    updateData.occupiedAt = null;
    updateData.vehiclePlate = null;
    updateData.driverName = null;
  }

  await updateDoc(slotRef, updateData);
  await addAuditLogInFirestore(
    source,
    isOccupied ? 'SENSOR_TRIGGER' : 'SENSOR_CLEAR',
    `Sensor E-0${slotId}: ${numDist.toFixed(1)} cm -> ${isOccupied ? 'OCUPADO (<10cm)' : 'LIBRE (>=10cm)'}`,
    isOccupied ? 'warning' : 'success'
  );
}

/**
 * Crear reserva en Firestore (CRUD: CREATE)
 */
export async function createReservationInFirestore(slotId, vehiclePlate, driverName, minutes = 60) {
  const slotRef = doc(db, SLOTS_COLLECTION, String(slotId));
  const fee = Math.round(minutes * 35);

  await updateDoc(slotRef, {
    status: 'reserved',
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    driverName: driverName.trim(),
    totalMinutes: minutes,
    feeCLP: fee,
    distanceCm: 45.0,
    reservedAt: new Date().toISOString(),
    updatedAt: serverTimestamp(),
  });

  await addDoc(collection(db, RESERVATIONS_COLLECTION), {
    slotId: Number(slotId),
    vehiclePlate: vehiclePlate.toUpperCase().trim(),
    driverName: driverName.trim(),
    minutes,
    feeCLP: fee,
    createdAt: serverTimestamp(),
  });

  await addAuditLogInFirestore(
    'Web / Firestore',
    'RESERVATION_CREATED',
    `Reserva creada en E-0${slotId} para ${driverName} (${vehiclePlate}). Pase QR generado.`,
    'success'
  );
}

/**
 * Liberar cupo en Firestore (CRUD: DELETE)
 */
export async function releaseSlotInFirestore(slotId, prevPlate = 'N/A', prevDriver = 'Conductor', minutes = 45) {
  const slotRef = doc(db, SLOTS_COLLECTION, String(slotId));
  const totalFee = Math.round(minutes * 35);

  await updateDoc(slotRef, {
    status: 'available',
    vehiclePlate: null,
    driverName: null,
    totalMinutes: 0,
    feeCLP: 0,
    distanceCm: 45.0,
    occupiedAt: null,
    reservedAt: null,
    updatedAt: serverTimestamp(),
  });

  await addAuditLogInFirestore(
    'Operador / Checkout',
    'SLOT_RELEASED',
    `Espacio E-0${slotId} liberado. Vehículo: ${prevPlate} (${prevDriver}). Cobro: $${totalFee} CLP.`,
    'info'
  );

  return {
    slotCode: `E-0${slotId}`,
    vehiclePlate: prevPlate,
    driverName: prevDriver,
    totalMinutes: minutes,
    totalFeeCLP: totalFee,
  };
}
