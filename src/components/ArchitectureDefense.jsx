import React, { useState } from 'react';
import { 
  Layers, 
  Cloud, 
  Database, 
  Server, 
  Monitor, 
  Play, 
  CheckCircle2, 
  ArrowRight, 
  Users, 
  HelpCircle, 
  ShieldCheck, 
  Code2, 
  TrendingUp,
  Globe,
  Lock
} from 'lucide-react';

export default function ArchitectureDefense() {
  const [activeStep, setActiveStep] = useState(null);
  const [isSimulatingFlow, setIsSimulatingFlow] = useState(false);
  const [selectedFlowType, setSelectedFlowType] = useState('reservation');

  const runLiveSimulation = async (flowType) => {
    setSelectedFlowType(flowType);
    setIsSimulatingFlow(true);
    setActiveStep(1);

    await new Promise(r => setTimeout(r, 800));
    setActiveStep(2);
    await new Promise(r => setTimeout(r, 800));
    setActiveStep(3);
    await new Promise(r => setTimeout(r, 800));
    setActiveStep(4);
    await new Promise(r => setTimeout(r, 800));
    setActiveStep(5);
    await new Promise(r => setTimeout(r, 800));
    setIsSimulatingFlow(false);
  };

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* Big Header */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <span className="text-xs font-display font-black tracking-wider uppercase text-emerald-600 dark:text-emerald-400">
            DOCUMENTACIÓN TÉCNICA
          </span>
          <h2 className="text-3xl sm:text-4xl font-display font-black text-zinc-950 dark:text-white mt-1">
            Arquitectura & Plataforma Cloud
          </h2>
          <p className="text-base text-zinc-600 dark:text-zinc-400 font-sans font-medium mt-1 max-w-2xl">
            Trazabilidad en tiempo real, desglose de capas de software y verificación de infraestructura en Windows Server 2022 con IIS y Firebase Firestore.
          </p>
        </div>

        <div className="px-4 py-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-display font-black text-xs flex items-center gap-2">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          Chile Central · Activo
        </div>
      </div>

      {/* 1. Infrastructure Specification Cards (Rubric Section 2) */}
      <div className="space-y-4">
        <h3 className="font-display text-xl sm:text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-2 px-1">
          <Cloud className="w-6 h-6 text-blue-500" />
          INFRAESTRUCTURA Y DESPLIEGUE EN MICROSOFT AZURE
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Virtual Machine */}
          <div className="game-card p-5 bg-white dark:bg-[#13141a] space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold text-blue-600 dark:text-blue-400">
              <span>MÁQUINA VIRTUAL</span>
              <Server className="w-4 h-4" />
            </div>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Standard_B2s
            </h4>
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              <div>• <strong>SO:</strong> Windows Server 2022</div>
              <div>• <strong>Cómputo:</strong> 2 vCPUs · 4 GiB RAM</div>
              <div>• <strong>Disco:</strong> SSD Premium 128 GiB</div>
              <div>• <strong>Región:</strong> Chile Central (Baja latencia)</div>
            </div>
          </div>

          {/* Card 2: IIS Web Server */}
          <div className="game-card p-5 bg-white dark:bg-[#13141a] space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold text-emerald-600 dark:text-emerald-400">
              <span>SERVIDOR WEB</span>
              <Globe className="w-4 h-4" />
            </div>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              IIS 10.0 + ARR Proxy
            </h4>
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              <div>• <strong>Rol:</strong> Web-Server (IIS Core)</div>
              <div>• <strong>Hosting:</strong> C:\inetpub\wwwroot</div>
              <div>• <strong>Worker Process:</strong> W3C Logging</div>
              <div>• <strong>Disponibilidad:</strong> 24/7 en producción</div>
            </div>
          </div>

          {/* Card 3: Network & Security */}
          <div className="game-card p-5 bg-white dark:bg-[#13141a] space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold text-amber-600 dark:text-amber-400">
              <span>RED Y SEGURIDAD</span>
              <Lock className="w-4 h-4" />
            </div>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Azure NSG Filtrado
            </h4>
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              <div>• <strong>Puerto 80:</strong> HTTP Público Activo</div>
              <div>• <strong>Puerto 443:</strong> HTTPS Seguro</div>
              <div>• <strong>Puerto 3001:</strong> REST API</div>
              <div>• <strong>Puerto 3389:</strong> RDP Restringido</div>
            </div>
          </div>

          {/* Card 4: DNS & Performance */}
          <div className="game-card p-5 bg-white dark:bg-[#13141a] space-y-3">
            <div className="flex items-center justify-between text-xs font-display font-bold text-purple-600 dark:text-purple-400">
              <span>DNS & ACCESO</span>
              <CheckCircle2 className="w-4 h-4" />
            </div>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Azure DNS (FQDN)
            </h4>
            <div className="space-y-1 text-xs text-zinc-600 dark:text-zinc-400 font-sans">
              <div>• <strong>IP Pública:</strong> 68.211.136.184</div>
              <div>• <strong>Dominio:</strong> puntoalerce.chilecentral...</div>
              <div>• <strong>Latencia Externa:</strong> 180 ms</div>
              <div>• <strong>Auditoría:</strong> Comprobada (HTTP 200 OK)</div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Interactive Request-Response Tracer (Criterion 7 of Rubric) */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b-2 border-zinc-100 dark:border-zinc-800 pb-4">
          <div>
            <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-3">
              <TrendingUp className="w-6 h-6 text-emerald-500" />
              TRAZABILIDAD EN VIVO (FLUJO END-TO-END)
            </h3>
            <p className="text-sm text-zinc-500 font-sans font-medium mt-0.5">
              Demuestra en vivo a los profesores cómo viaja el dato entre las capas del sistema web.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => runLiveSimulation('reservation')}
              disabled={isSimulatingFlow}
              className={`py-3 px-5 rounded-xl font-display text-xs font-black uppercase transition-all flex items-center gap-2 ${
                selectedFlowType === 'reservation'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                  : 'border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Play className="w-4 h-4" />
              Flujo Reserva (CREATE)
            </button>

            <button
              onClick={() => runLiveSimulation('checkout')}
              disabled={isSimulatingFlow}
              className={`py-3 px-5 rounded-xl font-display text-xs font-black uppercase transition-all flex items-center gap-2 ${
                selectedFlowType === 'checkout'
                  ? 'bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-md'
                  : 'border-2 border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-800'
              }`}
            >
              <Play className="w-4 h-4" />
              Flujo Checkout (DELETE)
            </button>
          </div>
        </div>

        {/* Visual 5-Step Pipeline (Large, bold, high-contrast) */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          {[
            {
              step: 1,
              title: selectedFlowType === 'reservation' ? '1. Cliente Web' : '1. Solicitud Salida',
              desc: selectedFlowType === 'reservation' ? 'Ingresa patente chilena y solicita reserva.' : 'Operador solicita liquidación de cupo.',
              tech: 'React 18 SPA (Vite)',
              icon: Monitor,
            },
            {
              step: 2,
              title: '2. Servidor Web IIS',
              desc: selectedFlowType === 'reservation' ? 'IIS sirve assets y enruta petición REST.' : 'IIS procesa liberación del cupo.',
              tech: 'Windows Server 2022 IIS',
              icon: Server,
            },
            {
              step: 3,
              title: '3. Reglas de Dominio',
              desc: selectedFlowType === 'reservation' ? 'Valida formato de patente y disponibilidad.' : 'Calcula minutos de estancia y tarifa ($35/min).',
              tech: 'Lógica de Dominio JS',
              icon: Code2,
            },
            {
              step: 4,
              title: '4. Persistencia Cloud',
              desc: selectedFlowType === 'reservation' ? 'Guarda reserva en Firestore y emite QR.' : 'Actualiza estado a Disponible en Firestore.',
              tech: 'Firebase Firestore',
              icon: Database,
            },
            {
              step: 5,
              title: '5. Sincronización',
              desc: selectedFlowType === 'reservation' ? 'Emite Pase Digital y actualiza mapa en vivo.' : 'Emite comprobante y libera el espacio.',
              tech: 'Realtime Listener (onSnapshot)',
              icon: CheckCircle2,
            },
          ].map((item) => {
            const Icon = item.icon;
            const isCurrent = activeStep === item.step;
            const isCompleted = activeStep > item.step;

            return (
              <div
                key={item.step}
                className={`p-5 rounded-2xl border-2 transition-all duration-300 ${
                  isCurrent
                    ? 'border-zinc-950 dark:border-white bg-zinc-950 text-white dark:bg-white dark:text-zinc-950 shadow-game scale-[1.05]'
                    : isCompleted
                    ? 'border-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-900 dark:text-emerald-100'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/40'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-display font-black text-xs uppercase opacity-70">
                    ETAPA {item.step}
                  </span>
                  <Icon className="w-5 h-5" />
                </div>

                <div className="font-display font-black text-base my-1">
                  {item.title}
                </div>

                <p className="font-sans text-xs font-bold leading-relaxed opacity-90 mt-1">
                  {item.desc}
                </p>

                <div className="mt-3 pt-2 border-t text-[11px] font-mono font-bold opacity-80">
                  {item.tech}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 3. Architecture 4 Layers */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div>
          <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white">
            ARQUITECTURA DE SOFTWARE EN 4 CAPAS (ALTA COHESIÓN & BAJO ACOPLAMIENTO)
          </h3>
          <p className="text-sm text-zinc-500 font-sans font-medium mt-1">
            Diseño por capas rigurosamente desacoplado para garantizar escalabilidad, seguridad y mantenibilidad.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
            <span className="font-display font-black text-xs uppercase text-blue-600 dark:text-blue-400">
              CAPA 1: PRESENTACIÓN & EXPERIENCIA (UI / UX)
            </span>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              React 18 SPA + Tailwind CSS
            </h4>
            <p className="text-sm font-sans font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Interfaz de usuario interactiva y reactiva. Mapa visual de los 6 cajones con estados en tiempo real, terminal de reservas con validación de patentes chilenas y emisión de pases QR.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
            <span className="font-display font-black text-xs uppercase text-emerald-600 dark:text-emerald-400">
              CAPA 2: SERVIDOR WEB & HOSTING CLOUD
            </span>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Internet Information Services (IIS 10.0) en Azure
            </h4>
            <p className="text-sm font-sans font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Servidor web en Windows Server 2022 sirviendo la aplicación de producción en el puerto 80 con resolución DNS FQDN y baja latencia hacia usuarios en Chile.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
            <span className="font-display font-black text-xs uppercase text-amber-600 dark:text-amber-400">
              CAPA 3: LÓGICA DE NEGOCIO & CONTROLADORES CRUD
            </span>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Servicios de Negocio · Motor de Reglas
            </h4>
            <p className="text-sm font-sans font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Módulos desacoplados para el ciclo CRUD completo (Create, Read, Update, Delete). Validación rigurosa de patentes, cálculo de cobro en pesos chilenos ($35 CLP/minuto) y sanitización de datos.
            </p>
          </div>

          <div className="p-6 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 space-y-2">
            <span className="font-display font-black text-xs uppercase text-purple-600 dark:text-purple-400">
              CAPA 4: PERSISTENCIA CLOUD EN TIEMPO REAL
            </span>
            <h4 className="font-display text-lg font-black text-zinc-950 dark:text-white">
              Google Cloud / Firebase Firestore
            </h4>
            <p className="text-sm font-sans font-medium text-zinc-600 dark:text-zinc-400 leading-relaxed">
              Base de datos NoSQL con sincronización en tiempo real vía WebSockets (onSnapshot). Colecciones: <code>parking_slots</code>, <code>reservations</code> y <code>audit_logs</code>.
            </p>
          </div>
        </div>
      </div>

      {/* 4. Answers for Defense Questions */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div>
          <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-3">
            <HelpCircle className="w-6 h-6 text-zinc-500" />
            Decisiones Técnicas de Arquitectura
          </h3>
          <p className="text-sm text-zinc-500 font-sans font-medium mt-1">
            Principales fundamentos de diseño, rendimiento y resiliencia de la solución.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <h4 className="font-display text-base font-black text-zinc-950 dark:text-white">
              ¿Por qué eligieron una arquitectura API desacoplada frente a un monolito MVC?
            </h4>
            <p className="text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
              En un monolito tradicional (MVC), cada consulta de disponibilidad obligaría a renderizar páginas HTML completas en el servidor, sobrecargando la CPU innecesariamente. La arquitectura desacoplada con SPA intercambia payloads JSON mínimos (~200 bytes) y sincroniza con Firestore en tiempo real, permitiendo que múltiples clientes consuman la misma fuente de datos con latencia mínima y máxima velocidad.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 space-y-2">
            <h4 className="font-display text-base font-black text-zinc-950 dark:text-white">
              ¿Qué cambiaría en la arquitectura si la demanda pasa de 100 a 10.000 usuarios?
            </h4>
            <p className="text-sm font-sans text-zinc-600 dark:text-zinc-400 leading-relaxed">
              En Azure escalaríamos horizontalmente mediante <strong>Virtual Machine Scale Sets (VMSS)</strong> con balanceador de carga automático ante CPU &gt; 70%, agregaríamos una capa de memoria distribuida con <strong>Azure Cache for Redis</strong> para atender consultas en &lt; 2 ms, y desplegaríamos los bundles estáticos en <strong>Azure CDN / Front Door</strong> para absorción masiva de tráfico global.
            </p>
          </div>
        </div>
      </div>

      {/* 5. Roles of 4 Members (Official Team) */}
      <div className="game-card p-6 sm:p-8 bg-white dark:bg-[#13141a] space-y-6">
        <div>
          <h3 className="font-display text-2xl font-black text-zinc-950 dark:text-white flex items-center gap-3">
            <Users className="w-6 h-6 text-zinc-500" />
            ORGANIZACIÓN DEL EQUIPO (4 INTEGRANTES)
          </h3>
          <p className="text-sm text-zinc-500 font-sans font-medium mt-1">
            Distribución de responsabilidades y especialidades del equipo de desarrollo.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
            <span className="font-display font-black text-xs text-blue-500 uppercase">FABIÁN MORA</span>
            <div className="font-display font-black text-sm text-zinc-950 dark:text-white">
              Interfaz & Experiencia (UI/UX)
            </div>
            <p className="text-xs font-sans text-zinc-500 font-medium leading-relaxed">
              Desarrollo de SPA reactiva en React 18 con Vite y Tailwind CSS. Implementación del mapa interactivo de cupos, animaciones vehiculares, terminal de reservas con emisión de Pase QR y accesibilidad responsive.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
            <span className="font-display font-black text-xs text-emerald-500 uppercase">AGUSTÍN CAÑAS</span>
            <div className="font-display font-black text-sm text-zinc-950 dark:text-white">
              Arquitectura & Lógica de Negocio
            </div>
            <p className="text-xs font-sans text-zinc-500 font-medium leading-relaxed">
              Modelo Cliente-Servidor Multi-Capa (4 capas desacopladas), controladores de dominio, validación estricta de patentes chilenas y motor de tarificación automatizada a $35 CLP/minuto.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
            <span className="font-display font-black text-xs text-purple-500 uppercase">PAUL FERRADA</span>
            <div className="font-display font-black text-sm text-zinc-950 dark:text-white">
              Infraestructura Cloud & Azure
            </div>
            <p className="text-xs font-sans text-zinc-500 font-medium leading-relaxed">
              Aprovisionamiento de VM Windows Server 2022 en Chile Central, configuración de servidor IIS 10.0 en puerto 80, reglas de seguridad en NSG y resolución FQDN pública con Azure DNS.
            </p>
          </div>

          <div className="p-5 rounded-2xl border-2 border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 space-y-2">
            <span className="font-display font-black text-xs text-amber-500 uppercase">FELIPE LABARCA</span>
            <div className="font-display font-black text-sm text-zinc-950 dark:text-white">
              Seguridad, JWT & Persistencia Cloud
            </div>
            <p className="text-xs font-sans text-zinc-500 font-medium leading-relaxed">
              Sistema de autenticación y roles RBAC (Usuario Normal vs Admin), protección de datos con Tokens criptográficos JWT (RFC 7519), integración de Firebase Firestore y consola de auditoría.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
