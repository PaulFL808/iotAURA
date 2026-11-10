import React, { useState } from 'react';
import { 
  CalendarClock, 
  Car, 
  QrCode, 
  CheckCircle, 
  AlertCircle, 
  User, 
  ArrowRight,
  Receipt,
  Check
} from 'lucide-react';
import confetti from 'canvas-confetti';

export default function ReservationTerminal({ 
  slots, 
  preselectedSlot, 
  onConfirmReservation 
}) {
  const [selectedSlotId, setSelectedSlotId] = useState(preselectedSlot ? preselectedSlot.id : (slots.find(s => s.status === 'available')?.id || 1));
  const [vehiclePlate, setVehiclePlate] = useState('');
  const [driverName, setDriverName] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successReceipt, setSuccessReceipt] = useState(null);

  const minuteRate = 35;
  const estimatedCost = durationMinutes * minuteRate;
  const availableSlots = slots.filter(s => s.status === 'available');
  const currentSlot = slots.find(s => s.id === Number(selectedSlotId));

  const formatPlate = (val) => {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6);
    if (clean.length > 4) {
      return `${clean.slice(0, 4)}-${clean.slice(4)}`;
    }
    return clean;
  };

  const handlePlateChange = (e) => {
    setVehiclePlate(formatPlate(e.target.value));
    if (errorMessage) setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');

    if (!selectedSlotId) {
      setErrorMessage('Selecciona un espacio disponible.');
      return;
    }

    if (!driverName.trim()) {
      setErrorMessage('Ingresa el nombre del conductor.');
      return;
    }

    const cleanPlate = vehiclePlate.replace('-', '').trim();
    if (cleanPlate.length < 5) {
      setErrorMessage('Ingresa una patente válida (ej: ABCD12 o AB1234).');
      return;
    }

    setIsLoading(true);

    try {
      await onConfirmReservation(selectedSlotId, cleanPlate, driverName.trim(), durationMinutes);
      
      confetti({
        particleCount: 60,
        spread: 60,
        origin: { y: 0.6 },
        colors: ['#10b981', '#3b82f6', '#f59e0b', '#000000']
      });

      setSuccessReceipt({
        slotCode: currentSlot?.code || `E-0${selectedSlotId}`,
        slotType: currentSlot?.type || 'standard',
        vehiclePlate: vehiclePlate,
        driverName: driverName.trim(),
        durationMinutes,
        estimatedCost,
        reservationCode: `AURA-${Date.now().toString().slice(-6)}`,
        timestamp: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
        date: new Date().toLocaleDateString('es-CL'),
      });

      setVehiclePlate('');
      setDriverName('');
    } catch (err) {
      setErrorMessage(err.message || 'Error al procesar la reserva');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-fadeIn">
      {/* Header: Simple & Direct */}
      <div className="game-card p-6 sm:p-7 bg-white dark:bg-[#13141a] text-center space-y-2">
        <h2 className="text-3xl sm:text-4xl font-display font-black tracking-tight text-zinc-950 dark:text-white">
          RESERVA TU ESPACIO
        </h2>
        <p className="text-base text-zinc-600 dark:text-zinc-400 font-sans font-medium">
          Selecciona tu lugar, ingresa la patente y obtén tu pase digital.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form (7 cols) */}
        <div className="lg:col-span-7 game-card p-6 sm:p-8 space-y-6 bg-white dark:bg-[#13141a]">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-red-50 dark:bg-red-950/40 border-2 border-red-300 dark:border-red-800 text-red-800 dark:text-red-200 text-xs font-bold flex items-center gap-2">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* 1. Slot Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-display font-black uppercase text-zinc-900 dark:text-white">
                1. Espacio ({availableSlots.length} libres)
              </label>

              <div className="grid grid-cols-3 gap-2.5">
                {slots.map((s) => {
                  const isAvail = s.status === 'available';
                  const isSelected = Number(selectedSlotId) === s.id;

                  return (
                    <button
                      key={s.id}
                      type="button"
                      disabled={!isAvail}
                      onClick={() => setSelectedSlotId(s.id)}
                      className={`p-3 rounded-xl border-2 text-left transition-all ${
                        isSelected && isAvail
                          ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-sm'
                          : isAvail
                          ? 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-400 bg-white dark:bg-zinc-900'
                          : 'border-zinc-100 dark:border-zinc-800/40 opacity-30 cursor-not-allowed'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-display font-black text-lg">{s.code}</span>
                        {isSelected && <Check className="w-4 h-4 text-emerald-400" />}
                      </div>
                      <div className="text-[11px] mt-1 font-display font-bold">
                        {s.status === 'available' ? '🟢 LIBRE' : s.status === 'reserved' ? '🟡 RESERVADO' : '🔴 OCUPADO'}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 2. License Plate & Driver Name */}
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-display font-black uppercase text-zinc-900 dark:text-white">
                  2. Patente
                </label>

                {/* Chilean Plate Mockup */}
                <div className="p-3 rounded-xl bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-200 dark:border-zinc-700 flex flex-col items-center">
                  <div className="w-full max-w-xs bg-white rounded-lg border-2 border-zinc-950 p-1.5 shadow-sm">
                    <div className="bg-blue-600 text-white text-[9px] font-display font-black text-center py-0.5 tracking-extra-wide uppercase rounded-sm">
                      CHILE
                    </div>
                    <input
                      type="text"
                      value={vehiclePlate}
                      onChange={handlePlateChange}
                      placeholder="ABCD-12"
                      maxLength={7}
                      required
                      className="w-full py-1 text-center font-display font-black text-2xl sm:text-3xl text-zinc-950 tracking-wider uppercase focus:outline-none placeholder-zinc-300"
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-display font-black uppercase text-zinc-900 dark:text-white">
                  3. Nombre del Conductor
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={driverName}
                    onChange={(e) => setDriverName(e.target.value)}
                    placeholder="Ej: Marcelo Morales"
                    required
                    className="w-full px-4 py-3 rounded-xl border-2 border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 font-sans text-sm font-bold focus:outline-none"
                  />
                  <User className="w-4 h-4 text-zinc-400 absolute right-4 top-3.5" />
                </div>
              </div>
            </div>

            {/* 3. Duration Selector */}
            <div className="space-y-1.5">
              <label className="block text-xs font-display font-black uppercase text-zinc-900 dark:text-white">
                4. Tiempo Estimado
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: '30 MIN', val: 30 },
                  { label: '1 HORA', val: 60 },
                  { label: '2 HORAS', val: 120 },
                  { label: '4 HORAS', val: 240 },
                ].map((dur) => (
                  <button
                    key={dur.val}
                    type="button"
                    onClick={() => setDurationMinutes(dur.val)}
                    className={`py-2.5 px-2 rounded-xl font-display text-xs font-black uppercase transition-all ${
                      durationMinutes === dur.val
                        ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 border-2 border-zinc-950 dark:border-white shadow-sm'
                        : 'bg-white dark:bg-zinc-900 border-2 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300'
                    }`}
                  >
                    {dur.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Rate & Submit Button */}
            <div className="pt-3 border-t-2 border-zinc-100 dark:border-zinc-800 flex items-center justify-between gap-4">
              <div>
                <span className="block text-[11px] font-display font-bold uppercase text-zinc-400">
                  TARIFA
                </span>
                <span className="text-2xl font-display font-black text-zinc-950 dark:text-white">
                  ${estimatedCost.toLocaleString('es-CL')} <span className="text-xs font-sans text-zinc-400">CLP</span>
                </span>
              </div>

              <button
                type="submit"
                disabled={isLoading || availableSlots.length === 0}
                className="btn-game-primary py-3.5 px-6 text-xs flex items-center justify-center gap-2 disabled:opacity-40"
              >
                {isLoading ? (
                  <span>PROCESANDO...</span>
                ) : (
                  <>
                    <span>RESERVAR</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Digital Ticket / Pass (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="text-xs font-display font-black uppercase text-zinc-400 px-1">
            PASE DIGITAL
          </div>

          {successReceipt ? (
            <div className="game-card p-6 bg-white dark:bg-[#13141a] border-2 border-emerald-400 shadow-md space-y-4 animate-car-in">
              <div className="text-center pb-3 border-b-2 border-dashed border-zinc-200 dark:border-zinc-800 space-y-1">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 mx-auto flex items-center justify-center">
                  <CheckCircle className="w-6 h-6" />
                </div>
                <h3 className="font-display text-xl font-black text-zinc-950 dark:text-white">
                  PASE CONFIRMADO
                </h3>
                <p className="font-mono text-xs text-zinc-400">
                  {successReceipt.reservationCode}
                </p>
              </div>

              <div className="space-y-2 font-sans text-xs">
                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold">ESPACIO:</span>
                  <span className="font-display font-black text-base text-zinc-950 dark:text-white">
                    {successReceipt.slotCode}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold">PATENTE:</span>
                  <span className="font-display font-black text-sm bg-yellow-300 text-zinc-950 px-2.5 py-0.5 rounded border border-zinc-950">
                    {successReceipt.vehiclePlate}
                  </span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold">CONDUCTOR:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{successReceipt.driverName}</span>
                </div>

                <div className="flex justify-between py-1 border-b border-zinc-100 dark:border-zinc-800">
                  <span className="text-zinc-500 font-bold">TIEMPO:</span>
                  <span className="font-bold text-zinc-900 dark:text-zinc-100">{successReceipt.durationMinutes} min</span>
                </div>

                <div className="flex justify-between pt-1">
                  <span className="font-display font-black text-sm">TOTAL:</span>
                  <span className="font-display font-black text-lg text-emerald-600 dark:text-emerald-400">
                    ${successReceipt.estimatedCost.toLocaleString('es-CL')} CLP
                  </span>
                </div>
              </div>

              <div className="pt-3 border-t-2 border-dashed border-zinc-200 dark:border-zinc-800 flex flex-col items-center justify-center gap-1.5">
                <div className="p-3 bg-white rounded-xl border-2 border-zinc-950">
                  <QrCode className="w-20 h-20 text-zinc-950" />
                </div>
                <span className="text-[11px] font-mono font-bold text-zinc-400 text-center">
                  Presenta este código al ingresar
                </span>
              </div>
            </div>
          ) : (
            <div className="game-card p-8 bg-zinc-100/60 dark:bg-zinc-900/40 border-dashed border-2 border-zinc-300 dark:border-zinc-800 text-center space-y-2">
              <div className="w-12 h-12 rounded-2xl bg-zinc-200 dark:bg-zinc-800 mx-auto flex items-center justify-center text-zinc-500">
                <Receipt className="w-6 h-6" />
              </div>
              <h4 className="font-display text-base font-bold text-zinc-800 dark:text-zinc-200">
                SIN RESERVA ACTIVA
              </h4>
              <p className="text-xs text-zinc-500 font-sans">
                Completa el formulario para emitir tu pase con QR.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
