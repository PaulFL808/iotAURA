import React from 'react';
import { 
  Radio, 
  Database, 
  LayoutDashboard, 
  CalendarClock, 
  Layers, 
  Moon, 
  Sun, 
  RefreshCw, 
  Car, 
  ShieldCheck, 
  User, 
  LogOut,
  Cpu,
  Flame
} from 'lucide-react';

export default function Header({ 
  currentTab, 
  setCurrentTab, 
  darkMode, 
  setDarkMode, 
  onRefresh, 
  isRefreshing, 
  isFirebaseConnected, 
  currentUser, 
  onOpenLogin, 
  onLogout,
  arduinoConnected,
  onConnectArduino,
  onDisconnectArduino
}) {
  const isAdmin = currentUser?.role === 'admin';

  // Navegación limpia y directa
  const allTabs = [
    { id: 'maqueta', label: 'Monitor IoT & Maqueta', icon: LayoutDashboard, adminOnly: false },
    { id: 'reserva', label: 'Reservar Plaza', icon: CalendarClock, adminOnly: false },
    { id: 'crud', label: 'Gestión Plazas', icon: Database, adminOnly: true },
    { id: 'dashboard', label: 'Analíticas', icon: Radio, adminOnly: true },
    { id: 'arquitectura', label: 'Ficha Técnica IoT', icon: Layers, adminOnly: true },
  ];

  // Filtro: opciones disponibles
  const visibleTabs = allTabs.filter(tab => !tab.adminOnly || isAdmin);

  return (
    <header className="sticky top-0 z-40 backdrop-blur-xl bg-white/95 dark:bg-[#090a0f]/95 border-b border-zinc-200 dark:border-zinc-800 transition-colors duration-200">
      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-8 py-3.5 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div 
          className="flex items-center gap-3 cursor-pointer select-none group" 
          onClick={() => setCurrentTab('maqueta')}
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 dark:bg-blue-500 text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
            <Car className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-display text-xl sm:text-2xl font-black tracking-tight text-zinc-950 dark:text-white">
                iot<span className="text-blue-600 dark:text-blue-400">AURA</span>
              </h1>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-medium border ${
                isFirebaseConnected 
                  ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80'
                  : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isFirebaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`}></span>
                {isFirebaseConnected ? 'Firebase iotaura' : 'Conectando BD...'}
              </span>
            </div>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-400 font-sans truncate max-w-[280px] sm:max-w-none">
              Paul Ferrada · Fabián Mora · Felipe Labarca · Agustín Cañas
            </p>
          </div>
        </div>

        {/* Pill Navigation for Desktop */}
        <nav className="hidden xl:flex items-center bg-zinc-100 dark:bg-zinc-900/90 p-1.5 rounded-2xl border border-zinc-200 dark:border-zinc-800">
          {visibleTabs.map(tab => {
            const Icon = tab.icon;
            const isActive = currentTab === tab.id;

            return (
              <button
                key={tab.id}
                onClick={() => setCurrentTab(tab.id)}
                className={`relative flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition-all duration-150 ${
                  isActive
                    ? 'bg-white dark:bg-zinc-800 text-zinc-950 dark:text-white shadow-sm font-bold'
                    : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-950 dark:hover:text-white'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-950 dark:text-white' : 'text-zinc-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Action Controls & Hardware Connection */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Arduino Status Button */}
          {arduinoConnected ? (
            <button
              onClick={onDisconnectArduino}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800 text-xs font-semibold hover:bg-teal-100 transition-all shadow-sm"
              title="Arduino UNO Conectado por USB Serial. Haz clic para desconectar."
            >
              <Cpu className="w-4 h-4 text-teal-600 dark:text-teal-400 animate-pulse" />
              <span className="hidden sm:inline">Arduino UNO</span>
              <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            </button>
          ) : (
            <button
              onClick={onConnectArduino}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-zinc-100 dark:bg-zinc-800 hover:bg-blue-50 dark:hover:bg-blue-950 hover:border-blue-300 text-zinc-700 dark:text-zinc-300 text-xs font-medium border border-zinc-200 dark:border-zinc-700 transition-all"
              title="Conectar Arduino UNO mediante Web Serial (USB a 9600 baudios)"
            >
              <Cpu className="w-4 h-4 text-zinc-500" />
              <span className="hidden sm:inline">Conectar Arduino</span>
            </button>
          )}

          {/* User Session Pill */}
          {isAdmin ? (
            <div className="flex items-center gap-1.5">
              <button 
                onClick={onOpenLogin}
                className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-purple-50 dark:bg-purple-950/50 text-purple-900 dark:text-purple-300 border border-purple-200 dark:border-purple-800 font-semibold text-xs hover:bg-purple-100 dark:hover:bg-purple-900/60 transition-colors"
                title="Sesión de Administrador activa"
              >
                <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                <span className="hidden md:inline">Admin</span>
              </button>

              <button
                onClick={onLogout}
                title="Cerrar sesión"
                className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-300 transition-colors"
              >
                <LogOut className="w-4 h-4 text-zinc-500 hover:text-red-500" />
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              title="Iniciar sesión"
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-xs font-semibold transition-colors"
            >
              <User className="w-3.5 h-3.5 text-zinc-500" />
              <span className="hidden sm:inline">Acceder</span>
            </button>
          )}

          <div className="h-5 w-px bg-zinc-200 dark:border-zinc-800 mx-0.5"></div>

          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            title="Sincronizar datos"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-emerald-500' : ''}`} />
          </button>

          <button
            onClick={() => setDarkMode(!darkMode)}
            title="Cambiar tema"
            className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-zinc-600" />}
          </button>
        </div>
      </div>

      {/* Mobile / Tablet Horizontal Navigation Tabs */}
      <div className="xl:hidden overflow-x-auto border-t border-zinc-200 dark:border-zinc-800 px-4 py-2 flex items-center gap-2 scrollbar-none">
        {visibleTabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setCurrentTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-zinc-950 dark:bg-white text-white dark:text-zinc-950 shadow-sm font-semibold'
                  : 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </header>
  );
}
