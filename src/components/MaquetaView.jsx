import React, { useState } from 'react';
import { 
  Zap, 
  Accessibility, 
  Crown, 
  ArrowRight, 
  ArrowLeft, 
  KeyRound,
  Lock,
  ShieldCheck,
  Check,
  Cpu,
  Terminal,
  ChevronDown,
  ChevronUp,
  Sliders,
  Send,
  Power,
  Sun,
  Eye,
  Sparkles,
  Timer
} from 'lucide-react';

// Top-Down Stylized Car SVG
function TopDownCar({ color = '#3b82f6', plate = 'CL-2026' }) {
  return (
    <div className="relative w-28 h-48 mx-auto animate-car-in filter drop-shadow-xl select-none">
      <svg viewBox="0 0 110 200" className="w-full h-full">
        <ellipse cx="55" cy="105" rx="48" ry="88" fill="rgba(0,0,0,0.35)" filter="blur(4px)" />
        <rect x="15" y="15" width="80" height="170" rx="36" fill={color} stroke="#18181b" strokeWidth="3" />
        <path d="M 24 55 Q 55 45 86 55 L 82 85 Q 55 80 28 85 Z" fill="#18181b" />
        <path d="M 28 135 Q 55 140 82 135 L 85 160 Q 55 152 25 160 Z" fill="#18181b" />
        <rect x="26" y="80" width="58" height="60" rx="14" fill="#09090b" opacity="0.85" />
        <rect x="20" y="16" width="16" height="8" rx="4" fill="#fef08a" />
        <rect x="74" y="16" width="16" height="8" rx="4" fill="#fef08a" />
        <rect x="22" y="176" width="16" height="7" rx="3.5" fill="#ef4444" />
        <rect x="72" y="176" width="16" height="7" rx="3.5" fill="#ef4444" />
        <rect x="6" y="60" width="10" height="16" rx="5" fill={color} stroke="#18181b" strokeWidth="2" />
        <rect x="94" y="60" width="10" height="16" rx="5" fill={color} stroke="#18181b" strokeWidth="2" />
        <rect x="30" y="98" width="50" height="18" rx="4" fill="#ffffff" stroke="#000000" strokeWidth="1.5" />
        <text x="55" y="111" fill="#000000" fontSize="9" fontWeight="900" fontFamily="Space Grotesk, sans-serif" textAnchor="middle">
          {plate}
        </text>
      </svg>
    </div>
  );
}

export default function MaquetaView({ 
  state, 
  onReserveClick, 
  onReleaseClick, 
  onSimulateDistance, 
  onToggleBarrier,
  onSetBarrier,
  isAdmin = true,
  arduinoConnected = false,
  onConnectArduino,
  onDisconnectArduino,
  arduinoLogs = []
}) {
  const [showSerialTerminal, setShowSerialTerminal] = useState(false);

  const slots = state?.slots || [];
  const barriers = state?.barriers || {
    entry: { status: 'closed', angle: 0 },
    exit: { status: 'closed', angle: 0 },
  };

  const availableCount = slots.filter(s => s.status === 'available').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const reservedCount = slots.filter(s => s.status === 'reserved').length;

  const handleOpenGate = (gate) => {
    if (onSetBarrier) {
      onSetBarrier(gate, 'open');
    } else if (onToggleBarrier) {
      onToggleBarrier(gate);
    }
  };

  const handleCloseGate = (gate) => {
    if (onSetBarrier) {
      onSetBarrier(gate, 'close');
    } else if (onToggleBarrier) {
      onToggleBarrier(gate);
    }
  };

  const getSlotTypeBadge = (type) => {
    switch (type) {
      case 'ev':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-blue-100 text-blue-900 dark:bg-blue-950 dark:text-blue-300 font-display font-bold text-[11px]">
            <Zap className="w-3.5 h-3.5 text-blue-600" /> EV
          </span>
        );
      case 'disabled':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-300 font-display font-bold text-[11px]">
            <Accessibility className="w-3.5 h-3.5 text-amber-600" /> Preferencial
          </span>
        );
      case 'vip':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-purple-100 text-purple-900 dark:bg-purple-950 dark:text-purple-300 font-display font-bold text-[11px]">
            <Crown className="w-3.5 h-3.5 text-purple-600" /> VIP
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 sm:space-y-8 animate-fadeIn">
      {/* Team & Project Header Banner */}
      <div className="game-card p-5 sm:p-6 bg-gradient-to-r from-blue-900 via-indigo-900 to-zinc-950 text-white rounded-3xl shadow-luxury relative overflow-hidden">
        <div className="absolute -right-12 -top-12 w-48 h-48 bg-blue-500/10 rounded-full blur-2xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30 text-[11px] font-bold tracking-wider uppercase">
                Ramo IoT · Maqueta Física
              </span>
              <span className="text-zinc-400 text-xs">Arduino UNO + Cloud Firestore</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black tracking-tight text-white">
              Dashboard de Control y Telemetría
            </h2>
            <p className="text-xs sm:text-sm text-zinc-300 font-sans">
              Integrantes: <strong className="text-white">Paul Ferrada</strong> · <strong className="text-white">Fabián Mora</strong> · <strong className="text-white">Felipe Labarca</strong> · <strong className="text-white">Agustín Cañas</strong>
            </p>
          </div>

          {/* Quick Arduino Connect Widget */}
          <div className="flex items-center gap-3">
            {arduinoConnected ? (
              <button
                onClick={onDisconnectArduino}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/30 transition-all text-xs font-semibold"
              >
                <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>Arduino Conectado (9600 Bd)</span>
              </button>
            ) : (
              <button
                onClick={onConnectArduino}
                className="flex items-center gap-2 px-4 py-2.5 rounded-2xl bg-blue-600 hover:bg-blue-500 border border-blue-400/40 text-white transition-all text-xs font-semibold shadow-md active:scale-95"
              >
                <Cpu className="w-4 h-4 text-white" />
                <span>Conectar Arduino (USB)</span>
              </button>
            )}

            <button
              onClick={() => setShowSerialTerminal(!showSerialTerminal)}
              className="p-2.5 rounded-2xl bg-white/10 hover:bg-white/20 border border-white/15 text-white transition-colors"
              title="Consola Serial en Vivo"
            >
              <Terminal className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Live Serial Console Dropdown */}
        {showSerialTerminal && (
          <div className="mt-4 pt-4 border-t border-white/10 font-mono text-xs">
            <div className="flex items-center justify-between pb-2 text-zinc-400">
              <span className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Consola Web Serial (Arduino UNO · 9600 baud)
              </span>
              <span>{arduinoLogs.length} eventos registrados</span>
            </div>
            <div className="bg-black/60 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 scrollbar-thin border border-white/5">
              {arduinoLogs.length === 0 ? (
                <p className="text-zinc-500 italic">No hay registros aún. Conecta el Arduino UNO por USB para recibir lecturas HC-SR04 y eventos de servos en tiempo real.</p>
              ) : (
                arduinoLogs.slice(-15).map((l, idx) => (
                  <div key={idx} className="flex items-start gap-2 text-[11px]">
                    <span className="text-zinc-500">[{l.time || 'NOW'}]</span>
                    <span className={l.type === 'rx' ? 'text-emerald-400' : l.type === 'tx' ? 'text-cyan-400' : 'text-amber-400'}>
                      {l.type === 'rx' ? '◄ [RX]' : l.type === 'tx' ? '► [TX]' : '● [SYS]'}
                    </span>
                    <span className="text-zinc-200">{l.text}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* Top Banner: Stats */}
      <div className="game-card p-5 sm:p-6 bg-white dark:bg-[#13141a]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <h3 className="text-xl sm:text-2xl font-display font-black text-zinc-950 dark:text-white tracking-tight">
              Estado de Ocupación
            </h3>
            <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 font-sans">
              Sincronizado bidireccionalmente con Firebase Cloud Firestore y Arduino.
            </p>
          </div>

          {/* Quick Stats Scoreboard */}
          <div className="grid grid-cols-3 gap-3 select-none">
            {/* Disponibles */}
            <div className="p-3.5 rounded-2xl bg-emerald-50/80 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 text-center min-w-[95px] sm:min-w-[110px]">
              <span className="block text-[11px] font-semibold text-emerald-800 dark:text-emerald-300">
                Disponibles
              </span>
              <span className="text-3xl sm:text-4xl font-display font-black text-emerald-600 dark:text-emerald-400 my-0.5 block">
                {availableCount}
              </span>
              <span className="text-[11px] text-emerald-700/80 dark:text-emerald-400/80 font-sans">
                de 6 plazas
              </span>
            </div>

            {/* Ocupados */}
            <div className="p-3.5 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-center min-w-[95px] sm:min-w-[110px]">
              <span className="block text-[11px] font-semibold text-zinc-700 dark:text-zinc-400">
                Ocupados
              </span>
              <span className="text-3xl sm:text-4xl font-display font-black text-zinc-900 dark:text-zinc-100 my-0.5 block">
                {occupiedCount}
              </span>
              <span className="text-[11px] text-zinc-500 font-sans">
                vehículos
              </span>
            </div>

            {/* Reservados */}
            <div className="p-3.5 rounded-2xl bg-amber-50/70 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/60 text-center min-w-[95px] sm:min-w-[110px]">
              <span className="block text-[11px] font-semibold text-amber-800 dark:text-amber-300">
                Reservados
              </span>
              <span className="text-3xl sm:text-4xl font-display font-black text-amber-600 dark:text-amber-400 my-0.5 block">
                {reservedCount}
              </span>
              <span className="text-[11px] text-amber-700/80 dark:text-amber-400/80 font-sans">
                agendados
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Gates & Totem Display (1x Servo Entrada + 2x LDRs + 2x LEDs Físicos) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Barrera 1 (Servomotor Entrada Pin 10 + LDR Entrada A0) - FÍSICA */}
        <div className="game-card p-5 sm:p-6 bg-white dark:bg-[#13141a] flex flex-col justify-between space-y-4 border-2 border-blue-500/40 dark:border-blue-500/30 shadow-lg rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black border transition-all ${
                barriers.entry?.status === 'open'
                  ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse shadow-lg shadow-emerald-500/30 scale-105'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
              }`}>
                <ArrowRight className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Barrera 1 (Entrada)
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Pin 10 PWM
                  </span>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300 border border-amber-200 dark:border-amber-800 flex items-center gap-1">
                    <Sun className="w-3 h-3 text-amber-600" />
                    LDR Entrada A0
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Servo SG90 Físico + Fotorreceptor LDR Pin A0
                </p>
              </div>
            </div>

            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              barriers.entry?.status === 'open' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400 shadow-sm animate-pulse' 
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
            }`}>
              {barriers.entry?.status === 'open' ? '▲ ABIERTA (90°)' : '▼ CERRADA (0°)'}
            </span>
          </div>

          {/* Detección Óptica Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-amber-500/10 dark:bg-amber-500/5 rounded-xl border border-amber-500/20 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-amber-700 dark:text-amber-400">
              <Eye className="w-3.5 h-3.5" /> Detección por Sombra (A0):
            </span>
            <span className="text-zinc-600 dark:text-zinc-300 font-mono text-[10px]">
              Apertura Auto / Cierre 1.5s
            </span>
          </div>

          {/* Visual Barrier Arm Animation */}
          <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex items-center justify-start">
            <div className="w-7 h-12 bg-amber-500 rounded-lg border-2 border-zinc-900 z-10 flex items-center justify-center shadow-md">
              <div className="w-3 h-3 rounded-full bg-zinc-900"></div>
            </div>
            <div 
              className="h-4 flex-1 rounded-r-lg border-2 border-zinc-900 ml-1 origin-left transition-transform duration-700 shadow-md flex"
              style={{
                transform: barriers.entry?.status === 'open' ? 'rotate(-65deg) translateY(-14px)' : 'rotate(0deg)',
                backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 14px, #ffffff 14px, #ffffff 28px)'
              }}
            ></div>
            <span className="absolute right-3 text-[10px] font-mono text-zinc-400 select-none">
              {barriers.entry?.status === 'open' ? '90° Paso Libre' : '0° Barrera Abajo'}
            </span>
          </div>

          {/* Botón Principal Prominente: Toggle 'E' */}
          <div className="space-y-2.5">
            <button
              onClick={() => onToggleBarrier('entry')}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                barriers.entry?.status === 'open'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-500/25'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>
                {barriers.entry?.status === 'open' ? '▼ Cerrar Entrada (Enviar "E")' : '▲ Abrir Entrada (Enviar "E")'}
              </span>
            </button>

            {/* Botones secundarios directos */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenGate('entry')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  barriers.entry?.status === 'open'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                }`}
                title="Abrir a 90°"
              >
                ▲ Abrir (90°)
              </button>

              <button
                onClick={() => handleCloseGate('entry')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  barriers.entry?.status === 'closed'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                }`}
                title="Cerrar a 0°"
              >
                ▼ Cerrar (0°)
              </button>
            </div>
          </div>
        </div>

        {/* Panel Central: Monitor de Hardware Arduino (1 Servo + 2 LDRs + 2 LEDs) */}
        <div className="game-card p-5 sm:p-6 bg-zinc-950 text-white font-mono border-zinc-800 flex flex-col justify-between space-y-4 shadow-xl rounded-3xl">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 border-b border-zinc-800/80 pb-3">
            <span className="flex items-center gap-2 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              ESTADO EN TIEMPO REAL
            </span>
            <span className="text-zinc-400 text-[11px] px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800">
              ARDUINO UNO
            </span>
          </div>

          <div className="space-y-2.5 py-1">
            <div className="bg-black/70 rounded-2xl p-3.5 border border-zinc-800/80 space-y-2 font-sans">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Servo Entrada (Pin 10):</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  barriers.entry?.status === 'open' 
                    ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' 
                    : 'bg-zinc-900 text-zinc-300 border border-zinc-800'
                }`}>
                  {barriers.entry?.status === 'open' ? 'ENTRADA: ABIERTA' : 'ENTRADA: CERRADA'}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">LDR Barrera Entrada:</span>
                <span className="font-bold text-amber-300 font-mono bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800 text-[11px]">
                  Pin A0 (Sombra abre)
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">LDR Puesto 1 (E-01):</span>
                <span className={`font-bold font-mono px-2 py-0.5 rounded text-[11px] ${
                  slots.find(s => s.id === 1 || s.code === 'E-01')?.status === 'occupied'
                    ? 'bg-red-950 text-red-300 border border-red-800 animate-pulse'
                    : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                }`}>
                  Pin A1 ({slots.find(s => s.id === 1 || s.code === 'E-01')?.status === 'occupied' ? 'OCUPADO' : 'LIBRE'})
                </span>
              </div>

              {/* Semáforo LED Bicolor Puesto 1 (Pines 7 y 8) */}
              <div className="flex items-center justify-between text-xs pt-1 border-t border-zinc-900">
                <span className="text-zinc-400">Semáforo LEDs (Puesto 1):</span>
                <div className="flex items-center gap-1.5 font-mono text-[10px]">
                  <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 border transition-all ${
                    slots.find(s => s.id === 1 || s.code === 'E-01')?.status !== 'occupied'
                      ? 'bg-emerald-950 text-emerald-300 border-emerald-700 shadow-sm shadow-emerald-500/40'
                      : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${slots.find(s => s.id === 1 || s.code === 'E-01')?.status !== 'occupied' ? 'bg-emerald-400 animate-pulse' : 'bg-zinc-700'}`} />
                    Pin 7 (Verde)
                  </span>
                  <span className={`px-1.5 py-0.5 rounded flex items-center gap-1 border transition-all ${
                    slots.find(s => s.id === 1 || s.code === 'E-01')?.status === 'occupied'
                      ? 'bg-red-950 text-red-300 border-red-700 shadow-sm shadow-red-500/40'
                      : 'bg-zinc-900 text-zinc-600 border-zinc-800 opacity-50'
                  }`}>
                    <span className={`w-2 h-2 rounded-full ${slots.find(s => s.id === 1 || s.code === 'E-01')?.status === 'occupied' ? 'bg-red-500 animate-pulse' : 'bg-zinc-700'}`} />
                    Pin 8 (Rojo)
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400">Conexión USB:</span>
                <span className={`font-bold font-mono text-[11px] ${arduinoConnected ? 'text-emerald-400' : 'text-zinc-500'}`}>
                  {arduinoConnected ? 'Conectado a 9600 Bd' : 'Sin conexión USB'}
                </span>
              </div>
            </div>

            <div className="text-[11px] text-zinc-300 bg-zinc-900/90 p-2.5 rounded-xl border border-zinc-800/80 flex items-center justify-between">
              <span>Alimentación USB 5V:</span>
              <span className="text-emerald-400 font-mono font-semibold">1 Servo (Potencia Estable)</span>
            </div>
          </div>

          <div className="text-[11px] text-zinc-500 flex items-center justify-between pt-2 border-t border-zinc-900">
            <span>iotAURA Hardware Protegido</span>
            <span className="text-emerald-500 font-bold">● En Línea</span>
          </div>
        </div>

        {/* Barrera 2 (Salida - Gemelo Digital / Cloud) */}
        <div className="game-card p-5 sm:p-6 bg-white dark:bg-[#13141a] flex flex-col justify-between space-y-4 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-3xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-11 h-11 rounded-2xl flex items-center justify-center font-display font-black border transition-all ${
                barriers.exit?.status === 'open'
                  ? 'bg-emerald-500 text-white border-emerald-600 animate-pulse shadow-md'
                  : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
              }`}>
                <ArrowLeft className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-1.5 flex-wrap">
                  <h4 className="text-base font-bold text-zinc-900 dark:text-white">
                    Barrera 2 (Salida)
                  </h4>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700">
                    Virtual / Cloud
                  </span>
                </div>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  Gemelo Digital sincronizado en Firebase Firestore
                </p>
              </div>
            </div>

            <span className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all ${
              barriers.exit?.status === 'open' 
                ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-400 shadow-sm' 
                : 'bg-zinc-100 text-zinc-700 dark:bg-zinc-800 dark:text-zinc-300 border border-zinc-300 dark:border-zinc-700'
            }`}>
              {barriers.exit?.status === 'open' ? '▲ ABIERTA (90°)' : '▼ CERRADA (0°)'}
            </span>
          </div>

          {/* Detección / Control Badge */}
          <div className="flex items-center justify-between px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900/60 rounded-xl border border-zinc-200 dark:border-zinc-800 text-[11px]">
            <span className="flex items-center gap-1.5 font-semibold text-zinc-600 dark:text-zinc-300">
              <Sliders className="w-3.5 h-3.5" /> Control en la Nube:
            </span>
            <span className="text-zinc-500 dark:text-zinc-400 font-mono text-[10px]">
              Sincronizado con Maqueta 3D
            </span>
          </div>

          {/* Visual Barrier Arm */}
          <div className="h-20 bg-zinc-100 dark:bg-zinc-900 rounded-2xl p-3 border border-zinc-200 dark:border-zinc-800 relative overflow-hidden flex items-center">
            <div className="w-7 h-12 bg-amber-500 rounded-lg border-2 border-zinc-900 z-10 flex items-center justify-center shadow-md">
              <div className="w-3 h-3 rounded-full bg-zinc-900"></div>
            </div>
            <div 
              className="h-4 flex-1 rounded-r-lg border-2 border-zinc-900 ml-1 origin-left transition-transform duration-700 shadow-md flex"
              style={{
                transform: barriers.exit?.status === 'open' ? 'rotate(-65deg) translateY(-14px)' : 'rotate(0deg)',
                backgroundImage: 'repeating-linear-gradient(45deg, #ef4444, #ef4444 14px, #ffffff 14px, #ffffff 28px)'
              }}
            ></div>
            <span className="absolute right-3 text-[10px] font-mono text-zinc-400 select-none">
              {barriers.exit?.status === 'open' ? '90° Paso Libre' : '0° Barrera Abajo'}
            </span>
          </div>

          {/* Botón Principal Prominente: Toggle Salida Virtual */}
          <div className="space-y-2.5">
            <button
              onClick={() => onToggleBarrier('exit')}
              className={`w-full py-3.5 px-4 rounded-2xl text-sm font-black transition-all shadow-md active:scale-95 flex items-center justify-center gap-2 ${
                barriers.exit?.status === 'open'
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-500/20'
                  : 'bg-zinc-800 hover:bg-zinc-700 text-white shadow-zinc-800/25'
              }`}
            >
              <Sliders className="w-4 h-4" />
              <span>
                {barriers.exit?.status === 'open' ? '▼ Cerrar Salida (Cloud)' : '▲ Abrir Salida (Cloud)'}
              </span>
            </button>

            {/* Direct Open / Close Controls */}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => handleOpenGate('exit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  barriers.exit?.status === 'open'
                    ? 'bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                }`}
                title="Abrir a 90°"
              >
                ▲ Abrir (90°)
              </button>

              <button
                onClick={() => handleCloseGate('exit')}
                className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                  barriers.exit?.status === 'closed'
                    ? 'bg-red-50 dark:bg-red-950/40 text-red-700 dark:text-red-300 border-red-300 dark:border-red-800'
                    : 'bg-zinc-50 dark:bg-zinc-800/60 hover:bg-red-50 dark:hover:bg-red-950/30 text-zinc-700 dark:text-zinc-200 border-zinc-200 dark:border-zinc-700'
                }`}
                title="Cerrar a 0°"
              >
                ▼ Cerrar (0°)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Banner Informativo de los Fotorreceptores LDR & LEDs */}
      <div className="game-card p-5 bg-gradient-to-r from-amber-500/10 via-blue-500/10 to-emerald-500/10 border border-amber-500/20 rounded-3xl flex flex-col md:flex-row items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 text-amber-500 flex items-center justify-center border border-amber-500/30 flex-shrink-0 shadow-inner">
            <Sun className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-bold text-zinc-900 dark:text-white text-sm">
                Arquitectura IoT: 1 Servo SG90 (Pin 10) + 2 LDRs (A0/A1) + Semáforo LED (Pines 7 y 8)
              </h4>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300 border border-emerald-300">
                Alimentación USB Estable
              </span>
            </div>
            <p className="text-xs text-zinc-600 dark:text-zinc-400 mt-1 max-w-3xl leading-relaxed">
              <strong>Entrada Físico-Óptica:</strong> El LDR en Pin A0 detecta la sombra del vehículo y abre suavemente la Barrera de Entrada (Pin 10); tras quedar libre, temporiza 1.5s antes del cierre automático. Comando web: <strong>&apos;E&apos;</strong>.<br />
              <strong>Plaza E-01 &amp; Semáforo Bicolor:</strong> El LDR en Pin A1 monitorea la plaza E-01 (con filtro promediado de 8 lecturas). Si se ocupa, conmuta físicamente el <strong>LED Verde (Pin 7)</strong> por el <strong>LED Rojo (Pin 8)</strong> y actualiza la nube en tiempo real.<br />
              <strong>Salida:</strong> Administrada como gemelo digital en Firebase Firestore para evitar sobrecarga en la línea de 5V del puerto USB.
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 flex-shrink-0">
          <span className="px-3.5 py-2 rounded-xl bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-mono text-xs font-bold shadow flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            9600 Baudios
          </span>
        </div>
      </div>

      {/* 6 Parking Slots */}
      <div className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="font-display text-lg sm:text-xl font-bold text-zinc-950 dark:text-white">
              Distribución de Plazas (Sensores HC-SR04)
            </h3>
            <p className="text-xs text-zinc-500">
              Detección de presencia física por distancia (&lt; 10 cm = Ocupado)
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400">
            6 plazas
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {slots.map((slot) => {
            const isOccupied = slot.status === 'occupied';
            const isReserved = slot.status === 'reserved';
            const isAvailable = slot.status === 'available';

            const carColors = ['#2563eb', '#dc2626', '#16a34a', '#d97706', '#9333ea', '#0284c7'];
            const assignedColor = carColors[slot.id - 1] || '#3b82f6';

            return (
              <div
                key={slot.id}
                className={`game-card relative overflow-hidden transition-all duration-200 flex flex-col justify-between ${
                  isOccupied
                    ? 'border-red-300 dark:border-red-800/80 bg-white dark:bg-[#15161e]'
                    : isReserved
                    ? 'border-amber-300 dark:border-amber-800/80 bg-amber-50/20 dark:bg-[#1a1714]'
                    : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#13141a]'
                }`}
              >
                {/* Header */}
                <div className="p-4 border-b border-zinc-100 dark:border-zinc-800 flex items-center justify-between">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-display text-xl font-black text-zinc-950 dark:text-white">
                      {slot.code}
                    </span>
                    {getSlotTypeBadge(slot.type)}
                    {(slot.id === 1 || slot.code === 'E-01') && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900 dark:bg-amber-950 dark:text-amber-200 border border-amber-400 flex items-center gap-1 shadow-xs">
                        <Sun className="w-3 h-3 text-amber-600 animate-spin-slow" />
                        LDR Pin A1 + LEDs 7/8 (Físico)
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700/60">
                    <span className={`w-2 h-2 rounded-full ${
                      isOccupied 
                        ? 'bg-red-500' 
                        : isReserved 
                        ? 'bg-amber-500' 
                        : 'bg-emerald-500'
                    }`} />
                    <span className="text-[11px] font-semibold text-zinc-700 dark:text-zinc-300">
                      {isOccupied ? 'Ocupado' : isReserved ? 'Reservado' : 'Disponible'}
                    </span>
                  </div>
                </div>

                {/* Road / Bay Visualization */}
                <div className="p-5 road-texture relative min-h-[240px] flex flex-col items-center justify-center border-y border-zinc-800 text-center">
                  <div className="absolute left-2 top-0 bottom-0 w-1 border-r-2 border-dashed border-yellow-400 opacity-60"></div>
                  <div className="absolute right-2 top-0 bottom-0 w-1 border-l-2 border-dashed border-yellow-400 opacity-60"></div>

                  {isOccupied && (
                    <div className="space-y-2">
                      <TopDownCar color={assignedColor} plate={slot.vehiclePlate || 'PATENTE'} />
                      <div className="bg-zinc-900/90 text-white px-3 py-1 rounded-xl border border-zinc-700 font-sans shadow-sm">
                        <div className="font-bold text-xs text-yellow-400">
                          {slot.vehiclePlate || 'VEHÍCULO'}
                        </div>
                        <div className="text-[11px] text-zinc-300">
                          {slot.driverName || 'Conductor'} · {slot.totalMinutes || 35} min
                        </div>
                      </div>
                    </div>
                  )}

                  {isReserved && (
                    <div className="space-y-2.5 animate-pulse">
                      <div className="w-16 h-16 rounded-full bg-amber-500/20 border-2 border-amber-400 flex items-center justify-center mx-auto text-amber-400 shadow-sm">
                        <KeyRound className="w-8 h-8" />
                      </div>
                      <div className="bg-zinc-900/90 text-white px-3 py-1.5 rounded-xl border border-amber-600 font-sans shadow-sm">
                        <div className="font-bold text-xs text-amber-400">
                          {slot.vehiclePlate}
                        </div>
                        <div className="text-[11px] text-zinc-300">
                          {slot.driverName}
                        </div>
                      </div>
                    </div>
                  )}

                  {isAvailable && (
                    <div className="space-y-1.5">
                      <div className="w-16 h-16 rounded-2xl border-2 border-dashed border-emerald-400/80 flex items-center justify-center mx-auto text-emerald-400 bg-emerald-950/30">
                        <span className="font-display font-black text-3xl">P</span>
                      </div>
                      <div className="text-xs font-semibold text-emerald-500">
                        Libre
                      </div>
                    </div>
                  )}
                </div>

                {/* Presence Sensor Gauge */}
                <div className="p-3 bg-zinc-50 dark:bg-zinc-900/60 border-b border-zinc-100 dark:border-zinc-800 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-zinc-500 flex items-center gap-1">
                      {(slot.id === 1 || slot.code === 'E-01') ? (
                        <>
                          <Sun className="w-3.5 h-3.5 text-amber-500" /> Sensor Óptico LDR (Pin A1):
                        </>
                      ) : (
                        'Distancia HC-SR04:'
                      )}
                    </span>
                    <span className={`font-semibold font-mono ${slot.distanceCm < 10 || isOccupied ? 'text-red-500' : 'text-emerald-600 dark:text-emerald-400'}`}>
                      {(slot.id === 1 || slot.code === 'E-01') ? (
                        isOccupied ? '● Vehículo presente (Sombra A1)' : '○ Puesto libre (Luz A1)'
                      ) : (
                        `${slot.distanceCm ? `${Number(slot.distanceCm).toFixed(1)} cm` : '50.0 cm'} (${slot.distanceCm < 10 ? 'Vehículo presente' : 'Espacio libre'})`
                      )}
                    </span>
                  </div>

                  <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 rounded-full ${
                        slot.distanceCm < 10 ? 'bg-red-500' : 'bg-emerald-500'
                      }`}
                      style={{ width: `${Math.min(100, (slot.distanceCm / 50) * 100)}%` }}
                    />
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="p-3 bg-white dark:bg-[#13141a]">
                  {isAvailable && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSimulateDistance(slot.id, 6.2)}
                        className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white transition-all shadow-sm"
                        title="Simular auto ingresando a la plaza"
                      >
                        Ocupar Plaza
                      </button>

                      <button
                        onClick={() => onReserveClick(slot)}
                        className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-zinc-950 hover:opacity-90 transition-all shadow-sm"
                      >
                        Reservar
                      </button>
                    </div>
                  )}

                  {isOccupied && (
                    <button
                      onClick={() => onReleaseClick(slot)}
                      className="w-full py-2 px-3 rounded-xl text-xs font-semibold bg-red-600 hover:bg-red-500 text-white transition-all shadow-sm"
                    >
                      Liberar / Cobrar
                    </button>
                  )}

                  {isReserved && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => onSimulateDistance(slot.id, 6.2)}
                        className="py-2 px-2.5 rounded-xl text-xs font-semibold bg-amber-500 hover:bg-amber-400 text-zinc-950 transition-all shadow-sm"
                      >
                        Confirmar Llegada
                      </button>

                      <button
                        onClick={() => onReleaseClick(slot)}
                        className="py-2 px-2.5 rounded-xl text-xs font-semibold border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 transition-all"
                      >
                        Cancelar
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
