import React, { useState } from 'react';
import { 
  X, 
  ShieldCheck, 
  User, 
  Lock, 
  Sparkles, 
  AlertCircle,
  Car,
  CheckCircle2
} from 'lucide-react';
import { login, loginQuick } from '../services/auth';

export default function LoginModal({ isOpen, onClose, onLoginSuccess }) {
  const [selectedRole, setSelectedRole] = useState('admin'); // 'admin' | 'user'
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin');
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleRoleTabChange = (role) => {
    setSelectedRole(role);
    setError(null);
    if (role === 'admin') {
      setUsername('admin');
      setPassword('admin');
    } else {
      setUsername('usuario');
      setPassword('usuario');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    setTimeout(() => {
      const res = login(username, password);
      setIsLoading(false);
      if (res.success) {
        onLoginSuccess(res.user);
        onClose();
      } else {
        setError(res.error);
      }
    }, 250);
  };

  const handleQuickLogin = (role) => {
    setIsLoading(true);
    setTimeout(() => {
      const user = loginQuick(role);
      setIsLoading(false);
      onLoginSuccess(user);
      onClose();
    }, 200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-md bg-white dark:bg-[#13141c] rounded-3xl border border-zinc-200 dark:border-zinc-800 shadow-2xl overflow-hidden transition-all"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="px-6 pt-6 pb-4 border-b border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-zinc-950 dark:text-white leading-tight">
              Iniciar Sesión
            </h3>
            <p className="text-xs text-zinc-500 font-sans">
              Ingresa tus credenciales para acceder
            </p>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full border border-zinc-200 dark:border-zinc-800 flex items-center justify-center text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Role Selection Tabs */}
        <div className="p-6 pb-2">
          <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 dark:bg-zinc-900 rounded-2xl border border-zinc-200 dark:border-zinc-800">
            <button
              type="button"
              onClick={() => handleRoleTabChange('admin')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedRole === 'admin'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <ShieldCheck className="w-4 h-4 text-purple-500" />
              <span>Administrador</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleTabChange('user')}
              className={`flex items-center justify-center gap-2 py-2 px-3 rounded-xl text-xs font-semibold transition-all ${
                selectedRole === 'user'
                  ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              <Car className="w-4 h-4 text-blue-500" />
              <span>Conductor</span>
            </button>
          </div>

          {/* Role Description Card */}
          <div className={`mt-3 p-3 rounded-xl border text-xs font-sans ${
            selectedRole === 'admin'
              ? 'bg-purple-50/50 dark:bg-purple-950/20 border-purple-200 dark:border-purple-800/60 text-purple-900 dark:text-purple-200'
              : 'bg-blue-50/50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800/60 text-blue-900 dark:text-blue-200'
          }`}>
            {selectedRole === 'admin' ? (
              <p className="text-zinc-600 dark:text-zinc-300">
                Acceso a gestión de estacionamiento, métricas, arquitectura cloud y control de barreras.
              </p>
            ) : (
              <p className="text-zinc-600 dark:text-zinc-300">
                Visualización de disponibilidad en tiempo real y reserva de plazas con pase QR.
              </p>
            )}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="px-6 py-4 space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-300 dark:border-red-800 text-red-700 dark:text-red-300 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Usuario
            </label>
            <div className="relative">
              <User className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="text"
                required
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Usuario"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-medium text-zinc-600 dark:text-zinc-400">
              Contraseña
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full pl-10 pr-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-sm focus:outline-none focus:border-zinc-950 dark:focus:border-white transition-colors"
              />
            </div>
            <div className="text-[11px] text-zinc-400 flex items-center justify-between pt-0.5">
              <span>Admin: <strong className="text-zinc-700 dark:text-zinc-300">admin / admin</strong></span>
              <span>Conductor: <strong className="text-zinc-700 dark:text-zinc-300">usuario / usuario</strong></span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-2.5 px-4 rounded-xl text-xs font-semibold bg-zinc-950 hover:bg-zinc-800 text-white dark:bg-white dark:hover:bg-zinc-200 dark:text-zinc-950 transition-all shadow-sm active:scale-95 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <span className="inline-block w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                <CheckCircle2 className="w-4 h-4" />
                <span>Ingresar como {selectedRole === 'admin' ? 'Administrador' : 'Conductor'}</span>
              </>
            )}
          </button>
        </form>

        {/* Quick Demo Login */}
        <div className="px-6 pb-6 pt-2 border-t border-zinc-100 dark:border-zinc-800/80 bg-zinc-50/50 dark:bg-zinc-900/40">
          <div className="flex items-center gap-2 mb-2 text-[11px] font-semibold text-zinc-400">
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            <span>Acceso rápido de prueba</span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => handleQuickLogin('user')}
              className="py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <Car className="w-3.5 h-3.5 text-blue-500" />
              <span>Conductor</span>
            </button>

            <button
              type="button"
              onClick={() => handleQuickLogin('admin')}
              className="py-1.5 px-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-medium transition-all flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-3.5 h-3.5 text-purple-500" />
              <span>Administrador</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
