import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import MaquetaView from './components/MaquetaView';
import ReservationTerminal from './components/ReservationTerminal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import CrudOperations from './components/CrudOperations';
import ArchitectureDefense from './components/ArchitectureDefense';
import LoginModal from './components/LoginModal';
import { getCurrentUser, logout } from './services/auth';
import { 
  getParkingState, 
  getLogs, 
  reserveSlot, 
  releaseSlot, 
  updateSlot, 
  sendTelemetry, 
  toggleBarrier, 
  resetParkingState 
} from './services/api';
import {
  seedInitialSlotsIfEmpty,
  seedInitialBarriersIfEmpty,
  subscribeToParkingSlots,
  subscribeToBarriers,
  subscribeToAuditLogs,
  createReservationInFirestore,
  updateSlotInFirestore,
  releaseSlotInFirestore,
  updateBarrierInFirestore,
  updateTelemetryInFirestore
} from './services/firebase';
import { arduinoSerial } from './services/arduinoSerial';

export default function App() {
  const [currentTab, setCurrentTab] = useState('maqueta');
  const [darkMode, setDarkMode] = useState(false);
  const [parkingState, setParkingState] = useState(null);
  const [logs, setLogs] = useState([]);
  const [preselectedSlot, setPreselectedSlot] = useState(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);
  const [isFirebaseConnected, setIsFirebaseConnected] = useState(false);

  // Arduino Web Serial State
  const [arduinoConnected, setArduinoConnected] = useState(false);
  const [arduinoLogs, setArduinoLogs] = useState([]);

  // Authentication & Role State (Default admin para facilidad del equipo de maqueta)
  const [currentUser, setCurrentUser] = useState(getCurrentUser);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const isAdmin = currentUser?.role === 'admin';

  // Si el usuario normal de alguna manera intenta acceder a crud o dashboard, redirigir a maqueta
  useEffect(() => {
    if (!isAdmin && (currentTab === 'crud' || currentTab === 'dashboard' || currentTab === 'arquitectura')) {
      setCurrentTab('maqueta');
    }
  }, [isAdmin, currentTab]);

  const showToast = (text, type = 'info') => {
    setToastMessage({ text, type });
    setTimeout(() => setToastMessage(null), 4000);
  };

  const handleLogout = () => {
    const guest = logout();
    setCurrentUser(guest);
    setCurrentTab('maqueta');
    showToast('Modo Conductor activado.', 'info');
  };

  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    showToast(`Sesión activa: ${user.name}`, 'success');
  };

  // Sync state con fallback API REST
  const loadData = async () => {
    try {
      const [stateData, logsData] = await Promise.all([
        getParkingState(),
        getLogs(),
      ]);
      setParkingState(prev => prev ? { ...stateData, slots: prev.slots || stateData.slots, barriers: prev.barriers || stateData.barriers } : stateData);
      if (!isFirebaseConnected) {
        setLogs(logsData);
      }
    } catch (err) {
      console.error('Error synchronizing API:', err);
    }
  };

  // 1. Suscripción a Firebase Firestore (Cupos, Barreras, Logs)
  useEffect(() => {
    loadData();

    // Sembrar cupos y barreras iniciales si están vacías
    seedInitialSlotsIfEmpty().then(() => {
      setIsFirebaseConnected(true);
    }).catch(err => console.warn('[Firebase Slots Init]:', err));

    seedInitialBarriersIfEmpty().catch(err => console.warn('[Firebase Barriers Init]:', err));

    // Suscribirse a cambios en tiempo real de los 6 cupos
    const unsubscribeSlots = subscribeToParkingSlots((firestoreSlots) => {
      if (firestoreSlots && firestoreSlots.length > 0) {
        setIsFirebaseConnected(true);
        setParkingState(prev => {
          const availableCount = firestoreSlots.filter(s => s.status === 'available').length;
          const occupiedCount = firestoreSlots.filter(s => s.status === 'occupied').length;
          const reservedCount = firestoreSlots.filter(s => s.status === 'reserved').length;

          return {
            ...(prev || {}),
            slots: firestoreSlots,
            barriers: prev?.barriers || { entry: { status: 'closed', angle: 0 }, exit: { status: 'closed', angle: 0 } },
            pricing: prev?.pricing || { baseRatePerHour: 2000, minuteRate: 35 },
            summary: {
              total: firestoreSlots.length,
              available: availableCount,
              occupied: occupiedCount,
              reserved: reservedCount,
              occupancyPercentage: Math.round(((occupiedCount + reservedCount) / firestoreSlots.length) * 100),
            }
          };
        });
      }
    });

    // Suscribirse a cambios en tiempo real de las barreras
    const unsubscribeBarriers = subscribeToBarriers((barriersData) => {
      if (barriersData) {
        setParkingState(prev => ({
          ...(prev || {}),
          barriers: {
            entry: barriersData.entry || prev?.barriers?.entry || { status: 'closed', angle: 0 },
            exit: barriersData.exit || prev?.barriers?.exit || { status: 'closed', angle: 0 }
          }
        }));
      }
    });

    // Suscribirse a logs en vivo en Firestore
    const unsubscribeLogs = subscribeToAuditLogs((firestoreLogs) => {
      if (firestoreLogs && firestoreLogs.length > 0) {
        setLogs(firestoreLogs);
      }
    });

    return () => {
      if (typeof unsubscribeSlots === 'function') unsubscribeSlots();
      if (typeof unsubscribeBarriers === 'function') unsubscribeBarriers();
      if (typeof unsubscribeLogs === 'function') unsubscribeLogs();
    };
  }, []);

  // 2. Suscripción a eventos del Arduino UNO mediante Web Serial
  useEffect(() => {
    const unStatus = arduinoSerial.on('status', ({ connected, error }) => {
      setArduinoConnected(connected);
      if (connected) {
        showToast('Arduino UNO conectado exitosamente vía Serial USB', 'success');
      } else if (error) {
        showToast(`Arduino desconectado o error: ${error}`, 'error');
      }
    });

    const unLog = arduinoSerial.on('rawLog', (logItem) => {
      setArduinoLogs(prev => [...prev.slice(-49), logItem]);
    });

    const unTelemetry = arduinoSerial.on('telemetry', (telemetrySlots) => {
      // Telemetría recibida desde Arduino (HC-SR04)
      telemetrySlots.forEach(s => {
        updateTelemetryInFirestore(s.id, s.dist).catch(e => {
          console.warn('[Telemetry Firestore Sync]:', e.message);
        });
      });
    });

    const unBarrierEvent = arduinoSerial.on('barrierEvent', (event) => {
      if (event === 'BARRIER_ENTRY_OPEN') {
        updateBarrierInFirestore('entry', 'open', 90).catch(() => {});
      } else if (event === 'BARRIER_ENTRY_CLOSED') {
        updateBarrierInFirestore('entry', 'closed', 0).catch(() => {});
      } else if (event === 'BARRIER_EXIT_OPEN') {
        updateBarrierInFirestore('exit', 'open', 90).catch(() => {});
      } else if (event === 'BARRIER_EXIT_CLOSED') {
        updateBarrierInFirestore('exit', 'closed', 0).catch(() => {});
      }
    });

    return () => {
      unStatus();
      unLog();
      unTelemetry();
      unBarrierEvent();
    };
  }, []);

  // Sync dark mode class
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [darkMode]);

  const handleManualRefresh = async () => {
    setIsRefreshing(true);
    await loadData();
    setTimeout(() => setIsRefreshing(false), 500);
    showToast('Sincronizado con Firebase Firestore (iotAURA)', 'success');
  };

  const handleReserveClick = (slot) => {
    setPreselectedSlot(slot);
    setCurrentTab('reserva');
  };

  const handleReleaseClick = async (slot) => {
    if (!window.confirm(`¿Confirmas la liberación del espacio ${slot.code} y la emisión del cobro?`)) {
      return;
    }
    try {
      // 1. Liberar en Firebase Firestore
      await releaseSlotInFirestore(slot.id, slot.vehiclePlate || 'N/A', slot.driverName || 'Conductor', slot.totalMinutes || 45);
      
      // 2. Liberar también en API REST local como respaldo
      try { await releaseSlot(slot.id); } catch(e) {}

      showToast(`Espacio ${slot.code} liberado en Firebase Firestore. Cobro liquidado.`, 'success');
    } catch (err) {
      showToast(err.message || 'Error al liberar espacio', 'error');
    }
  };

  const handleConfirmReservation = async (slotId, vehiclePlate, driverName, durationMinutes) => {
    try {
      // 1. Guardar en Firebase Firestore
      await createReservationInFirestore(slotId, vehiclePlate, driverName, durationMinutes);

      // 2. Guardar en API REST local como respaldo
      try { await reserveSlot(slotId, vehiclePlate, driverName, durationMinutes); } catch(e) {}

      showToast(`Reserva guardada en Firestore para ${vehiclePlate}. Pase QR emitido.`, 'success');
      return { success: true, data: { code: `E-0${slotId}` } };
    } catch (err) {
      showToast(err.message || 'Error al guardar reserva', 'error');
      throw err;
    }
  };

  const handleSimulateDistance = async (slotId, distanceCm) => {
    try {
      const isPresent = distanceCm < 10;
      await updateSlotInFirestore(slotId, {
        distanceCm,
        status: isPresent ? 'occupied' : 'available',
        vehiclePlate: isPresent ? 'AUTO-DETECT' : null,
        driverName: isPresent ? 'Conductor Presente' : null,
      });
    } catch (e) {
      await sendTelemetry(slotId, distanceCm);
      await loadData();
    }
  };

  // Control directo de apertura y cierre de barrera (Entrada / Salida)
  const handleSetBarrier = async (gate, action) => { // action: 'open' | 'close' | 'toggle'
    try {
      const currentBarrier = parkingState?.barriers?.[gate] || { status: 'closed', angle: 0 };
      const targetStatus = action === 'toggle' 
        ? (currentBarrier.status === 'open' ? 'closed' : 'open') 
        : action;
      
      const angle = targetStatus === 'open' ? 90 : 0;

      // 1. Si Arduino UNO está conectado por Web Serial, enviar comando de servomotor inmediatamente
      if (arduinoConnected) {
        if (gate === 'entry') {
          if (targetStatus === 'open') await arduinoSerial.openEntry();
          else await arduinoSerial.closeEntry();
        } else {
          if (targetStatus === 'open') await arduinoSerial.openExit();
          else await arduinoSerial.closeExit();
        }
      }

      // 2. Actualizar en Firebase Firestore (sincroniza con cualquier otra pantalla o dispositivo)
      await updateBarrierInFirestore(gate, targetStatus, angle);

      // 3. Respaldo en API local
      try { await toggleBarrier(gate, targetStatus); } catch (e) {}

      // 4. Actualizar estado visual inmediato
      setParkingState(prev => ({
        ...(prev || {}),
        barriers: {
          ...(prev?.barriers || {}),
          [gate]: { status: targetStatus, angle, lastAction: new Date().toISOString() }
        }
      }));

      showToast(`Barrera de ${gate === 'entry' ? 'Entrada' : 'Salida'} ${targetStatus === 'open' ? 'levantada a 90°' : 'cerrada a 0°'}${arduinoConnected ? ' (Comando enviado al Arduino)' : ''}`, 'info');
    } catch (err) {
      showToast(`Error al controlar barrera: ${err.message}`, 'error');
    }
  };

  const handleToggleBarrier = async (gate) => {
    return handleSetBarrier(gate, 'toggle');
  };

  const handleConnectArduino = async () => {
    try {
      await arduinoSerial.connect(9600);
    } catch (err) {
      showToast(err.message || 'No se pudo conectar al puerto serial del Arduino', 'error');
    }
  };

  const handleDisconnectArduino = async () => {
    await arduinoSerial.disconnect();
    showToast('Arduino UNO desconectado', 'info');
  };

  const handleUpdateSlot = async (slotId, updateData) => {
    try {
      // 1. Actualizar en Firebase Firestore
      await updateSlotInFirestore(slotId, updateData);

      // 2. Actualizar en API local
      try { await updateSlot(slotId, updateData); } catch(e) {}

      showToast(`Espacio E-0${slotId} actualizado en Firestore`, 'success');
      return { success: true };
    } catch (err) {
      showToast(err.message || 'Error al actualizar', 'error');
      throw err;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#fafafa] dark:bg-[#09090b] text-zinc-900 dark:text-zinc-100 transition-colors duration-300">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 animate-fadeIn">
          <div className="px-4 py-3 rounded-xl bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 text-xs font-mono shadow-luxury border border-zinc-800 dark:border-zinc-200 flex items-center gap-2">
            <span className={`w-2 h-2 rounded-full ${toastMessage.type === 'error' ? 'bg-red-500' : 'bg-emerald-400'} animate-pulse`}></span>
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Login Modal */}
      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      {/* Header with Auth Role Info & Arduino Connection Status */}
      <Header
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        darkMode={darkMode}
        setDarkMode={setDarkMode}
        onRefresh={handleManualRefresh}
        isRefreshing={isRefreshing}
        isFirebaseConnected={isFirebaseConnected}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
        arduinoConnected={arduinoConnected}
        onConnectArduino={handleConnectArduino}
        onDisconnectArduino={handleDisconnectArduino}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-8 py-6 sm:py-8">
        {currentTab === 'maqueta' && (
          <MaquetaView
            state={parkingState}
            onReserveClick={handleReserveClick}
            onReleaseClick={handleReleaseClick}
            onSimulateDistance={handleSimulateDistance}
            onToggleBarrier={handleToggleBarrier}
            onSetBarrier={handleSetBarrier}
            isAdmin={isAdmin}
            arduinoConnected={arduinoConnected}
            onConnectArduino={handleConnectArduino}
            onDisconnectArduino={handleDisconnectArduino}
            arduinoLogs={arduinoLogs}
          />
        )}

        {currentTab === 'reserva' && (
          <ReservationTerminal
            slots={parkingState?.slots || []}
            preselectedSlot={preselectedSlot}
            onConfirmReservation={handleConfirmReservation}
          />
        )}

        {currentTab === 'crud' && isAdmin && (
          <CrudOperations
            state={parkingState}
            onReserveClick={handleReserveClick}
            onReleaseClick={handleReleaseClick}
            onUpdateSlot={handleUpdateSlot}
            onRefresh={handleManualRefresh}
          />
        )}

        {currentTab === 'dashboard' && isAdmin && (
          <AnalyticsDashboard
            state={parkingState}
            logs={logs}
          />
        )}

        {currentTab === 'arquitectura' && isAdmin && (
          <ArchitectureDefense />
        )}
      </main>

      {/* Minimalist Editorial Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800/80 bg-white/50 dark:bg-zinc-950/50 py-6 px-4 sm:px-8 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-zinc-500 dark:text-zinc-400">
          <div className="flex items-center gap-3">
            <span className="font-display font-bold text-sm tracking-tight text-zinc-950 dark:text-white">
              iotAURA SMART PARKING
            </span>
            <span>·</span>
            <span>Maqueta IoT Arduino UNO + Firebase</span>
          </div>

          <div className="flex items-center gap-3 font-mono text-[11px] flex-wrap justify-center">
            <span>Paul Ferrada</span>
            <span>·</span>
            <span>Fabián Mora</span>
            <span>·</span>
            <span>Felipe Labarca</span>
            <span>·</span>
            <span>Agustín Cañas</span>
            <span>·</span>
            <button
              onClick={async () => {
                if (window.confirm('¿Reiniciar estado a los valores de prueba por defecto?')) {
                  await resetParkingState();
                  await loadData();
                  showToast('Sistema reiniciado a valores por defecto', 'info');
                }
              }}
              className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200 underline"
            >
              Reiniciar Datos Demo
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
