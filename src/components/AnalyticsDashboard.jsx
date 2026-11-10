import React, { useState } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  Clock, 
  DollarSign, 
  Activity, 
  Search, 
  CheckCircle2, 
  AlertTriangle, 
  Info,
  Radio
} from 'lucide-react';

export default function AnalyticsDashboard({ state, logs = [] }) {
  const [logFilter, setLogFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const slots = state?.slots || [];
  const availableCount = slots.filter(s => s.status === 'available').length;
  const occupiedCount = slots.filter(s => s.status === 'occupied').length;
  const reservedCount = slots.filter(s => s.status === 'reserved').length;
  const occupancyRate = Math.round(((occupiedCount + reservedCount) / (slots.length || 6)) * 100);

  const peakHours = [
    { hour: '08:00', percent: 35 },
    { hour: '10:00', percent: 65 },
    { hour: '12:00', percent: 95 },
    { hour: '14:00', percent: 80 },
    { hour: '16:00', percent: 55 },
    { hour: '18:00', percent: 100 },
    { hour: '20:00', percent: 45 },
  ];

  const formatSeverity = (sev) => {
    switch (sev) {
      case 'success': return 'ÉXITO';
      case 'warning': return 'ALERTA';
      case 'error': return 'ERROR';
      default: return 'INFO';
    }
  };

  const formatType = (type) => {
    switch (type) {
      case 'OCCUPANCY_CHANGE': return 'CAMBIO ESTADO';
      case 'RESERVATION_CREATED': return 'RESERVA CREADA';
      case 'BARRIER_CYCLE': return 'CICLO BARRERA';
      case 'BARRIER_COMMAND': return 'COMANDO BARRERA';
      case 'SLOT_RELEASED': return 'LIBERACIÓN CUPO';
      case 'SENSOR_TRIGGER': return 'DETECCIÓN SENSOR';
      case 'SENSOR_CLEAR': return 'SENSOR LIBRE';
      case 'RESET': return 'REINICIO';
      default: return type;
    }
  };

  const filteredLogs = logs.filter(log => {
    if (logFilter !== 'all' && log.severity !== logFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return (
        log.details.toLowerCase().includes(q) ||
        log.source.toLowerCase().includes(q) ||
        log.type.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-8 animate-fadeIn">
      {/* Header */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-display font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            Métricas del Sistema
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-zinc-950 dark:text-white mt-1">
            Panel de Rendimiento
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 font-sans font-medium mt-1">
            Indicadores de ocupación, afluencia y registro de actividad.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 font-display font-black text-xs flex items-center gap-2">
            <Activity className="w-4 h-4 text-emerald-500 animate-pulse" />
            Sincronizado
          </div>
        </div>
      </div>

      {/* Giant KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Occupancy Rate */}
        <div className="game-card p-6 bg-white dark:bg-[#13141a] space-y-3">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-display font-black uppercase">
            <span>OCUPACIÓN ACTUAL</span>
            <Activity className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-5xl font-display font-black text-zinc-950 dark:text-white">
            {occupancyRate}%
          </div>
          <div className="w-full bg-zinc-200 dark:bg-zinc-800 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 transition-all duration-500"
              style={{ width: `${occupancyRate}%` }}
            />
          </div>
          <span className="block text-xs font-sans font-bold text-zinc-500">
            {occupiedCount + reservedCount} de 6 espacios ocupados
          </span>
        </div>

        {/* Vehicles Today */}
        <div className="game-card p-6 bg-white dark:bg-[#13141a] space-y-3">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-display font-black uppercase">
            <span>ROTACIÓN HOY</span>
            <TrendingUp className="w-5 h-5 text-blue-500" />
          </div>
          <div className="text-5xl font-display font-black text-zinc-950 dark:text-white">
            42
          </div>
          <span className="inline-block text-xs font-display font-extrabold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950 px-2 py-0.5 rounded-md">
            +18% VS SEMANA ANTERIOR
          </span>
          <span className="block text-xs font-sans font-bold text-zinc-500">
            Vehículos ingresados por barrera
          </span>
        </div>

        {/* Stay Duration */}
        <div className="game-card p-6 bg-white dark:bg-[#13141a] space-y-3">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-display font-black uppercase">
            <span>ESTADÍA MEDIA</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="text-5xl font-display font-black text-zinc-950 dark:text-white">
            48 <span className="text-lg font-sans font-bold text-zinc-400">min</span>
          </div>
          <span className="inline-block text-xs font-display font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950 px-2 py-0.5 rounded-md">
            ALTA ROTACIÓN
          </span>
          <span className="block text-xs font-sans font-bold text-zinc-500">
            Medido por sensores HC-SR04
          </span>
        </div>

        {/* Revenue */}
        <div className="game-card p-6 bg-white dark:bg-[#13141a] space-y-3">
          <div className="flex items-center justify-between text-zinc-500 text-xs font-display font-black uppercase">
            <span>RECAUDACIÓN</span>
            <DollarSign className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="text-4xl sm:text-5xl font-display font-black text-zinc-950 dark:text-white">
            $68.4K <span className="text-sm font-sans font-bold text-zinc-400">CLP</span>
          </div>
          <span className="inline-block text-xs font-display font-extrabold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950 px-2 py-0.5 rounded-md">
            $35 CLP / MINUTO
          </span>
          <span className="block text-xs font-sans font-bold text-zinc-500">
            Facturación en tiempo real activa
          </span>
        </div>
      </div>

      {/* Peak Hours Chart */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div className="flex items-center justify-between border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white">
              HORAS PUNTA DE OCUPACIÓN
            </h3>
            <p className="text-sm font-sans font-medium text-zinc-500">
              Distribución de mayor demanda registrada por los sensores de entrada
            </p>
          </div>
          <span className="font-display font-black text-xs uppercase px-3 py-1 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            HOY
          </span>
        </div>

        <div className="pt-8 pb-4 flex items-end justify-between gap-4 h-64 border-b-2 border-zinc-200 dark:border-zinc-800">
          {peakHours.map((item) => (
            <div key={item.hour} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group">
              <span className="font-display text-xs font-black text-zinc-600 dark:text-zinc-300">
                {item.percent}%
              </span>
              <div
                className={`w-full rounded-t-xl transition-all duration-500 shadow-md ${
                  item.percent >= 90
                    ? 'bg-red-500'
                    : item.percent >= 60
                    ? 'bg-amber-500'
                    : 'bg-emerald-500'
                }`}
                style={{ height: `${item.percent}%` }}
              />
              <span className="font-display text-xs font-black text-zinc-950 dark:text-white mt-2">
                {item.hour}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Event Logs Table */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white">
              REGISTROS DE AUDITORÍA & EVENTOS
            </h3>
            <p className="text-sm font-sans font-medium text-zinc-500">
              Trazabilidad en tiempo real de órdenes de hardware y peticiones API en Azure
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar evento..."
                className="px-4 py-2.5 pl-10 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 font-sans text-xs font-bold focus:outline-none"
              />
              <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-3" />
            </div>

            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="px-4 py-2.5 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 font-display text-xs font-bold bg-white dark:bg-zinc-900"
            >
              <option value="all">TODOS</option>
              <option value="info">INFO</option>
              <option value="success">ÉXITO</option>
              <option value="warning">ALERTA</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm font-sans">
            <thead>
              <tr className="border-b-2 border-zinc-200 dark:border-zinc-800 font-display text-xs font-black uppercase text-zinc-400">
                <th className="py-3 px-3">HORA</th>
                <th className="py-3 px-3">ORIGEN</th>
                <th className="py-3 px-3">TIPO</th>
                <th className="py-3 px-3">DETALLE</th>
                <th className="py-3 px-3 text-right">ESTADO</th>
              </tr>
            </thead>
            <tbody className="divide-y border-zinc-100 dark:divide-zinc-800 font-medium">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-900/50">
                  <td className="py-3 px-3 font-mono text-xs font-bold text-zinc-400">
                    {new Date(log.timestamp).toLocaleTimeString('es-CL')}
                  </td>
                  <td className="py-3 px-3 font-bold text-zinc-900 dark:text-white">
                    {log.source}
                  </td>
                  <td className="py-3 px-3 font-mono text-xs text-zinc-500 font-bold">
                    {formatType(log.type)}
                  </td>
                  <td className="py-3 px-3 text-zinc-700 dark:text-zinc-300">
                    {log.details}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <span className={`inline-block font-display text-[10px] font-black px-2.5 py-1 rounded-md uppercase ${
                      log.severity === 'success'
                        ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                        : log.severity === 'warning'
                        ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                        : 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-300'
                    }`}>
                      {formatSeverity(log.severity)}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
