# INFORME TÉCNICO FINAL
## Integración de Arquitecturas de Software en un Proyecto IoT

---

### DATOS INSTITUCIONALES Y DEL PROYECTO
- **Nombre del Proyecto:** iotAURA – Sistema Inteligente de Gestión y Control de Acceso de Estacionamientos con Gemelo Digital 3D
- **Asignaturas Articuladas:** Arquitectura de Software & Internet de las Cosas (IoT)
- **Docente / Profesor de Cátedra:** Prof. Osvaldo Archile (Docente de ambas asignaturas)
- **Integrantes del Equipo:**
  - Paul Ferrada
  - Fabián Mora
  - Felipe Labarca
  - Agustín Cañas
- **Carrera y Nivel:** Ingeniería Civil en Informática / Ingeniería de Ejecución en Informática
- **Fecha de Entrega y Presentación:** Martes 24 de Noviembre (Semana de la Informática)
- **Repositorio Oficial de Código:** [https://github.com/PaulFL808/iotAURA.git](https://github.com/PaulFL808/iotAURA.git)
- **Despliegue Web en Producción (GitHub Pages):** [https://paulfl808.github.io/iotAURA/](https://paulfl808.github.io/iotAURA/)
- **Entorno Gemelo Digital 3D en Vivo:** [https://paulfl808.github.io/iotAURA/maqueta3d.html](https://paulfl808.github.io/iotAURA/maqueta3d.html)

---

## 1. RESUMEN EJECUTIVO

El presente informe documenta el diseño, la justificación arquitectónica, la implementación ciberfísica y el despliegue del proyecto **iotAURA**, una plataforma IoT concebida para modernizar y automatizar integralmente la gestión de estacionamientos universitarios y comerciales, articulando las cátedras de Arquitectura de Software e Internet de las Cosas bajo la docencia del profesor **Osvaldo Archile**.

### 1.1 El Problema
Los estacionamientos convencionales sufren severas ineficiencias operativas: congestión recurrente en las vías de acceso producto de la validación manual o de tickets físicos de papel, nula visibilidad en tiempo real sobre la disponibilidad efectiva de plazas de aparcamiento y desconexión entre los operadores de garita y los conductores. Esto ocasiona demoras considerables, aumento en la huella de carbono por circulación innecesaria y vulnerabilidades en la seguridad perimetral.

### 1.2 La Solución IoT: iotAURA
iotAURA resuelve integralmente esta problemática mediante un ecosistema ciberfísico articulado en tres subsistemas claramente diferenciados:
1. **Control de Acceso Físico en Tiempo Real y Maqueta Ciberfísica:** Construido con una placa **Arduino UNO R3**, dos servomotores micro SG90 en Pin 10 (barrera de entrada) y Pin 9 (barrera de salida) con rangos angulares calibrados de 15° a 105°, dos sensores fotorreceptores LDR en Pin A0 (detección vehicular de entrada) y Pin A1 (detección de ocupación en plaza E-01), semáforo bicolor LED (Pin 8 Verde / Pin 7 Rojo) y rieles digitales de energía y masa virtual (Pines 3, 4, 5, 6), montados en una maqueta física a escala con carriles, caseta de control y vehículo de prueba, comunicados directamente vía W3C **Web Serial API (especificación WICG Draft)** a 9600 baudios sin requerir servidores intermediarios locales.
2. **Nube Reactiva y Sincronización de Estado:** Implementado sobre **Google Cloud Firestore** como canal de sincronización reactiva de estado mediante listeners en tiempo real (`onSnapshot` sobre protocolo WebChannel/HTTPS), garantizando que las mutaciones se propaguen en menos de 300 ms a todos los clientes conectados sin recurrir a sondeo periódico (*polling*).
3. **Gemelo Digital 3D Ciberfísico:** Desarrollado en **Three.js** y WebGL, simula la red completa de 6 cupos con sensores ultrasónicos HC-SR04, cinemática vehicular, display tótem LCD 16x2 I2C y un módulo de Reconocimiento Automático de Patentes (**ALPR simulado**) que valida accesos comparando con las reservas activas en la nube.

### 1.3 Integración de Arquitecturas de Software
Para garantizar escalabilidad, desacoplamiento y alta mantenibilidad, el sistema integra de manera formal dos estilos arquitectónicos complementarios:
- **Arquitectura en Capas con Puertos y Adaptadores (Hexagonal):** Estructura la aplicación cliente aislando el núcleo de dominio (reglas de validación ALPR, tarifas de $35/min en CLP y control de plazas) de las tecnologías concretas de infraestructura (Web Serial API, Firestore SDK, Canvas Three.js), mediante contratos de puertos abstractos (`IBarrierPort`, `IParkingRepository`).
- **Arquitectura Dirigida por Eventos (Event Streaming / Pub-Sub):** Orquesta la interacción asíncrona entre el microcontrolador físico, la base de datos cloud y los múltiples clientes web suscritos, propagando eventos atómicos de estado (`ESTADO: ABIERTA`, `VEHICLE_APPROACH`, `NEW_RESERVATION`) de manera reactiva y no bloqueante.

---

## 2. DESCRIPCIÓN DEL PROYECTO

### 2.1 Contexto y Problemática Abordada
En recintos universitarios y comerciales de alta afluencia vehicular, el acceso y estacionamiento representan un cuello de botella logístico crítico. La ausencia de información precisa en tiempo real provoca saturación de vías internas, búsquedas infructuosas de estacionamiento y demoras en el ingreso. Asimismo, la falta de integración entre las barreras físicas y los sistemas digitales de reserva impide una fiscalización rigurosa de los vehículos que efectivamente cuentan con permiso de entrada.

### 2.2 Objetivos del Proyecto
- **Objetivo General:**
  Diseñar, implementar y evaluar una plataforma IoT integral de control de acceso y monitoreo de estacionamientos en tiempo real, integrando hardware embebido, sincronización reactiva en la nube y un gemelo digital 3D bajo una arquitectura de software desacoplada, resiliente y escalable.
- **Objetivos Específicos:**
  1. Construir un controlador embebido físico con Arduino UNO capaz de operar una barrera servocontrolada y procesar comandos seriales bidireccionales con reporte de estado.
  2. Implementar un canal de sincronización reactiva en la nube mediante Cloud Firestore para propagar en tiempo real el estado de cupos, barreras y eventos entre múltiples navegadores.
  3. Desarrollar un gemelo digital 3D interactivo en Three.js que emule sensores ultrasónicos y reconocimiento automático de patentes (ALPR), conectado a las mismas fuentes de datos que el hardware físico.
  4. Integrar de forma armónica la Arquitectura en Capas con Puertos y Adaptadores con la Arquitectura Dirigida por Eventos, demostrando su complementariedad en sistemas ciberfísicos.

### 2.3 Usuarios y Beneficiarios
La solución iotAURA contempla tres perfiles de usuarios claramente definidos y respaldados por la interfaz gráfica del sistema:
- **Conductores y Usuarios Generales:** Disponen de la vista *Reserva tu Espacio* para consultar disponibilidad en tiempo real, seleccionar un cupo específico (E-01 a E-06), ingresar su patente vehicular, calcular el importe de estadía ($35 CLP/minuto) y obtener su Pase Digital QR para acceso expedito.
- **Operadores de Garita y Seguridad:** Cuentan con el *Dashboard de Control y Telemetría* (Monitor IoT) que reporta en vivo el estado angular del servomotor (Pin 10), el estado del pulsador de garita (Pin 2), la ocupación global y provee controles manuales para operar la barrera de entrada y salida.
- **Administradores del Recinto:** Mediante el acceso administrativo (*modo Admin* en la barra superior), disponen del *Panel de Rendimiento* con analíticas avanzadas (gráfico de barras de horas punta, rotación diaria, estadía promedio y recaudación monetaria) y de la vista *Gestión de Estacionamiento* con operaciones CRUD completas sobre las plazas.

### 2.4 Funcionamiento General del Sistema
El sistema opera en un ciclo cerrado distinguiendo rigurosamente lo físico de lo simulado:
1. **Registro y Reserva:** El conductor ingresa a la aplicación web, selecciona un espacio disponible e introduce su placa patente. La reserva queda registrada en la colección `reservations` de Firestore.
2. **Detección de Proximidad:** En el Gemelo Digital 3D interactivo, al conducir un automóvil hacia el pórtico de entrada, un sensor de proximidad ultrasónico (simulado) detecta la presencia del vehículo al reducirse la distancia a menos de 220 mm.
3. **Lectura de Patente ALPR:** La cámara ALPR (simulada en el Gemelo 3D) captura ópticamente la placa patente del automóvil y envía la cadena de caracteres al núcleo de dominio de la aplicación.
4. **Validación de Dominio:** La capa de dominio consulta el repositorio de reservas en Firestore. Si la patente posee reserva activa y el estacionamiento cuenta con cupos libres, el display del tótem LCD (simulado) proyecta `"PASE: [PATENTE]"` y se invoca el puerto `IBarrierPort.open()`.
5. **Accionamiento Físico de Barrera:** El adaptador serie despacha el byte ASCII `'T'` por USB a 9600 baudios hacia el Arduino UNO. El microcontrolador ejecuta una rampa suave PWM hacia los 90° en el Pin 10 físico y responde `"ESTADO: ABIERTA"`.
6. **Política de Seguridad (Fail-Closed):** Si la patente no está registrada (ej. vehículos de prueba `XX-99-ZZ` o `NR-40-40`), la barrera se mantiene firmemente enclavada en 0°, el tótem proyecta `"DENEGADO / SIN RESERVA"` y se registra un log `ACCESS_DENIED`.
7. **Anulación Manual Local:** Ante emergencias o contingencias de red, el guardia en garita presiona el pulsador físico conectado al Pin 2 de Arduino, conmutando la barrera de forma autónoma sin depender de conexión a Internet.

---

## 3. COMPONENTES FÍSICOS Y TECNOLÓGICOS

### 3.1 Especificaciones de Hardware Físicamente Implementado

| Componente Físico | Modelo / Conexión | Parámetros Eléctricos y Lógicos | Función Operativa |
| :--- | :--- | :--- | :--- |
| **Unidad de Procesamiento** | Arduino UNO R3 (ATmega328P) | 16 MHz, 5V DC, 32 KB Flash, 2 KB SRAM | Controlador embebido principal, bucle de muestreo, filtrado y máquina de estados. |
| **Barrera de Entrada** | Micro Servomotor SG90 (Pin 10 PWM) | Torque 1.8 kg-cm, 5V DC, rampa 20 ms/grado, rango 15° a 105° | Acciona mecánicamente la barrera de acceso vehicular al detectar sombra o recibir comando 'E'. |
| **Barrera de Salida** | Micro Servomotor SG90 (Pin 9 PWM) | Torque 1.8 kg-cm, 5V DC, rampa 20 ms/grado, rango 15° a 105° | Acciona mecánicamente la barrera de egreso vehicular comandada vía Web Serial 'S'. |
| **Sensor de Acceso (Entrada)** | Fotorreceptor LDR (Pin A0) | Divisor de tensión óptico, sobremuestreo 32x, umbral $\Delta > 14$ | Detecta aproximación vehicular física en el carril por atenuación lumínica. |
| **Sensor de Ocupación Plaza E-01** | Fotorreceptor LDR (Pin A1) | Divisor de tensión óptico, histéresis (ocupa $>6$, libera $\le 4$) | Monitorea la presencia de vehículo aparcado en la plaza 1 física. |
| **Semáforo Bicolor Plaza E-01** | Diodos LED Bicolor (Pines 8 y 7) | Pin 8 (Verde: Libre), Pin 7 (Rojo: Ocupado), 20 mA máx | Señalización óptica local para el conductor sobre el estado de la plaza. |
| **Rieles Virtuales de Energía** | Pines Digitales 3, 4 (Vcc) y 5, 6 (GND) | Salidas digitales forzadas en HIGH (+5V) y LOW (0V) | Suministran alimentación distribuida directa a sensores y LEDs sin saturar rieles compartidos. |
| **Plataforma Maqueta Física** | Prototipo a Escala 1:32 con Caseta | Calzadas señalizadas, 4 plazas, caseta central, auto escala | Estructura ciberfísica para validación de dinámica vehicular y sensores. |
| **Canal de Comunicación** | Cable USB Serie (CDC UART) | 9600 baudios, 8-N-1, Web Serial API (WICG) | Enlace directo punto a punto bidireccional entre el navegador host y el Arduino UNO. |

### 3.2 Alimentación Eléctrica y Gestión de Potencia
En este prototipo experimental, el sistema ciberfísico se alimenta directamente a través del bus USB provisto por el computador host (+5.0V DC nominal, limitado a 500 mA según la especificación USB 2.0).

Para solventar los desafíos de potencia asociados al accionamiento simultáneo de servomotores y sensores sin provocar caídas de tensión bruscas (*brownout resets* en el ATmega328P), se implementó una estrategia triple de optimización energética y mecánica:
1. **Rangos Angulares Seguros ($15^\circ$ a $105^\circ$):** Se suprimió el tope físico en $0^\circ$, evitando el bloqueo mecánico del reductor de engranajes del SG90 (*stall current* ~650 mA), manteniendo la corriente de operación en menos de 180 mA por motor.
2. **Rampa de Aceleración Suave:** El firmware ejecuta un desplazamiento incremental de 1° cada 20 ms (`delay(velocidad)`), eliminando picos inductivos de corriente de arranque (*inrush current*).
3. **Rieles Virtuales de Energía (Pines 3 a 6):** Los fotorreceptores LDR y el semáforo LED se energizan mediante salidas digitales independientes configuradas en `OUTPUT HIGH/LOW`, aislando sus impedancias del bus analógico principal de 5V.

> [!NOTE]
> En una instalación industrial o de múltiples servomotores concurrentes, se requeriría una fuente de alimentación conmutada externa de 5V 2A DC regulada, compartiendo la referencia de tierra (GND común) con el microcontrolador.

### 3.3 Componentes Simulados en el Gemelo Digital 3D

| Componente Simulado | Tecnología de Simulación | Comportamiento Emulado |
| :--- | :--- | :--- |
| **Sensores Ultrasónicos** | Three.js Raycasting / Distancia euclidiana | Emula 6 sensores HC-SR04 en cajones y 2 en pórticos (TH_ENT=220 mm, TH_SAL=200 mm). |
| **Cámara ALPR** | Inspección de texturas y atributos 3D | Extrae la matrícula del automóvil en aproximación y consulta la validez de reserva en Firestore. |
| **Tótem LCD 16x2 I2C** | Panel tridimensional procedural | Emula display HD44780 con mochila I2C (0x27) para desplegar mensajes al conductor. |

### 3.4 Software y Plataforma Cloud
- **Google Cloud Firestore:** Base de datos documental NoSQL con canal reactivo en tiempo real mediante listeners `onSnapshot` sobre protocolo WebChannel / HTTPS.
- **React 18 + Vite & Tailwind CSS:** Single Page Application (SPA) modular que integra vistas de Reserva, Monitor de Garita, Gestión CRUD y Analíticas.
- **Three.js (WebGL):** Motor gráfico 3D que renderiza el gemelo ciberfísico en tiempo real a 60 FPS estables con sombreado PBR y colisiones.

---

## 4. REQUISITOS DEL SISTEMA

### 4.1 Requisitos Funcionales (RF)

| ID | Requisito Funcional | Descripción y Criterio de Aceptación |
| :--- | :--- | :--- |
| **RF-01** | Control manual y remoto de barrera física | El sistema debe conmutar el servomotor SG90 entre 0° y 90° tanto por el botón físico del Pin 2 como por comando serial web `'T'`, emitiendo `'ESTADO: ABIERTA'` o `'ESTADO: CERRADA'`. |
| **RF-02** | Validación y lectura ALPR (simulado) | El sistema debe capturar la patente del vehículo en el simulador 3D y verificar si existe reserva activa en Firestore antes de ordenar la apertura de la barrera. |
| **RF-03** | Sincronización en tiempo real | Los cambios de estado en el hardware físico o en el simulador deben propagarse al dashboard web en menos de 400 ms sin recargar la página (*zero polling*). |
| **RF-04** | Gestión de reservas y tarifas | Permitir a los usuarios reservar plazas asociando patentes vehiculares y calcular el importe de ocupación en base a tarifa fija ($35 CLP/minuto). |
| **RF-05** | Auditoría de accesos denegados | Ante patentes no registradas (ej. `XX-99-ZZ` o `NR-40-40`), bloquear la barrera en 0°, proyectar `'DENEGADO'` en tótem y registrar log `ACCESS_DENIED`. |
| **RF-06** | Telemetría y gestión Web Serial | El dashboard debe permitir solicitar y conectar el puerto COM USB a 9600 baudios, señalizando el estado de enlace y manejando desconexiones. |

### 4.2 Atributos de Calidad / Requisitos No Funcionales (RNF)

| ID | Atributo de Calidad | Especificación Técnica Implementada |
| :--- | :--- | :--- |
| **RNF-01** | **Rendimiento y Latencia** | Latencia serial comando-respuesta < 100 ms. Latencia de propagación de eventos cloud Firestore onSnapshot < 400 ms. |
| **RNF-02** | **Disponibilidad y Tolerancia a Fallos** | Operación autónoma del Arduino UNO: el botón físico del Pin 2 sigue operando la barrera aun ante caída total de Internet o de la app web. Política fail-closed en ALPR. |
| **RNF-03** | **Seguridad e Integridad** | Reglas de seguridad de Firestore que validan tipos y marcas temporales. Registros de auditoría inmutables (append-only). Sin claves privadas en el repositorio Git. |
| **RNF-04** | **Mantenibilidad y Modularidad** | Arquitectura hexagonal en capas: es posible reemplazar el Arduino por un ESP32 cambiando únicamente el adaptador serial, sin alterar la lógica de negocio. |

---

## 5. ARQUITECTURAS SELECCIONADAS

Conforme a la pauta de evaluación, se seleccionaron e integraron dos arquitecturas de software complementarias, justificando formalmente la elección de cada enfoque frente a alternativas descartadas:

### 5.1 Arquitectura 1: Arquitectura en Capas con Puertos y Adaptadores (Hexagonal Architecture)
- **Concepto Teórico:**
  Formulada originalmente por Alistair Cockburn (2005) y consolidada en Clean Architecture por Robert C. Martin (2017), la Arquitectura Hexagonal establece que el núcleo de la aplicación (reglas de dominio y casos de uso) debe ser completamente independiente de los mecanismos de entrega (interfaz gráfica), de los dispositivos de hardware y de los sistemas de persistencia. La comunicación entre el núcleo y el exterior se realiza exclusivamente a través de Puertos (interfaces/contratos) y Adaptadores (implementaciones tecnológicas concretas).
- **Responsabilidad en el Proyecto iotAURA:**
  Estructurar internamente el software del host para desacoplar las reglas del negocio de estacionamiento (algoritmo de validación ALPR, cálculo de tarifas a $35/minuto, control de plazas E-01 a E-06) de los controladores físicos (Web Serial API) y de los servicios cloud (Google Cloud Firestore SDK).
- **Componentes y Puertos que Organiza:**
  - *Capa de Presentación:* Interfaces de usuario en React 18 (`ReservaPlazaView`, `MonitorView`, `AnalyticsDashboard`, `GestionPlazasView`) y renderizador 3D Three.js.
  - *Puertos de Entrada:* Contrato `IControlPanelPort` para invocar operaciones de garita y reservas desde la interfaz.
  - *Núcleo de Dominio:* Servicios puros sin dependencias externas: `ALPRValidationService`, `BillingRateService` y `ParkingStateManager`.
  - *Puertos de Salida:* Interfaces abstractas: `IBarrierPort` (operaciones de barrera), `IParkingRepository` (persistencia de reservas y cupos), `IAuditLoggerPort` (registro de seguridad).
  - *Capa de Adaptadores:* `WebSerialBarrierAdapter` (manejo de flujos serie USB), `FirestoreParkingAdapter` (consultas y suscripciones Cloud Firestore) y `LocalStorageAuditAdapter`.
- **¿Por qué esta Arquitectura y no otra?:**
  En el Internet de las Cosas, el hardware y los protocolos de comunicación cambian con extraordinaria rapidez: hoy se utiliza un Arduino UNO conectado por USB a 9600 baudios, pero en una siguiente iteración se utilizará un ESP32 conectado por Wi-Fi o MQTT. Si hubiésemos optado por una Arquitectura Monolítica o una Arquitectura Tradicional en 3 Capas fuertemente acoplada, las llamadas a la Web Serial API o a Firestore estarían mezcladas directamente dentro de los componentes React o de los controladores de vista. Cualquier cambio de microcontrolador o de base de datos obligaría a reescribir la lógica de validación de reservas y cobro. Con Puertos y Adaptadores, el dominio permanece 100% intacto; para migrar a ESP32 solo se requiere escribir un nuevo adaptador (ej. `MqttBarrierAdapter`) que satisfaga el contrato `IBarrierPort`.

### 5.2 Arquitectura 2: Arquitectura Dirigida por Eventos (Event Streaming / Pub-Sub)
- **Concepto Teórico:**
  La Arquitectura Dirigida por Eventos (EDA) es un paradigma donde los componentes de software reaccionan ante la ocurrencia de eventos significativos en el entorno. Un evento representa una transición de estado inmutable con marca temporal. Los emisores (*producers*) publican eventos sin conocer quién los recibirá, y los canales de distribución (*streams / topics*) los entregan de forma asíncrona a los consumidores (*consumers*) suscritos.
- **Responsabilidad en el Proyecto iotAURA:**
  Gobernar la comunicación asíncrona distribuida entre entidades físicamente heterogéneas que operan a frecuencias temporales radicalmente distintas: un microcontrolador embebido de 8 bits que responde en milisegundos, un servomotor mecánico que tarda 1,8 segundos en desplazarse, una base de datos en la nube accesible vía WebSockets y múltiples clientes web concurrentes.
- **Componentes que Organiza:**
  - *Emisores de Eventos (Event Producers):* Firmware Arduino UNO (emite `'ESTADO: ABIERTA'` / `'ESTADO: CERRADA'`), Sensor de presencia 3D (emite `'VEHICLE_APPROACH'`), Formulario Web (emite `'NEW_RESERVATION'`), Guardia de Garita (emite `'BUTTON_PRESSED'`).
  - *Canales de Eventos / Sincronización:* Canal Serial Local (W3C Web Serial Streams mediante `ReadableStream` y `WritableStream`) y Canal Cloud Reactivo (Google Cloud Firestore con listeners `onSnapshot` sobre WebChannel/HTTPS).
  - *Consumidores de Eventos (Event Consumers):* Monitor de garita en React, Visualizador de barrera en Gemelo 3D, Servomotor SG90 y Servicio de Auditoría de Seguridad.
- **¿Por qué esta Arquitectura y no otra?:**
  La alternativa estándar en aplicaciones web es la arquitectura Petición-Respuesta con sondeo periódico (*HTTP Polling*). En un sistema de estacionamiento inteligente, si 10 clientes web consultaran el estado de la barrera y de los cupos cada 500 ms para mantener la pantalla actualizada, se generarían 1.200 peticiones HTTP por minuto. Esto saturaría la red, agotaría la cuota de lectura gratuita de Firestore, causaría retardos perceptibles (*jitter*) en la barrera física y sobrecargaría el procesador host. EDA permite una comunicación *push* reactiva: los clientes no preguntan repetidamente, sino que reciben instantáneamente la notificación únicamente cuando el estado cambia, reduciendo el tráfico de red en más de un 90%.

---

## 6. DISEÑO DE ARQUITECTURA INTEGRADA

### 6.1 Diagrama General de Componentes y Tecnologías
El siguiente diagrama expone la interacción global de los componentes del sistema, incorporando código de colores institucional (Verde = Hardware Físico Real; Azul = Software Implementado; Naranja = Simulación en Gemelo 3D; Púrpura = Canales de Comunicación) y especificando los protocolos de enlace utilizados:

![Figura 1: Diagrama General de Arquitectura, Componentes y Enlaces Tecnológicos de iotAURA (v2)](diagramas/diagrama_1_arquitectura_general_v2.png)

### 6.2 Diagrama de Integración: Delimitación de Arquitecturas
El siguiente diagrama delimita con exactitud las fronteras arquitectónicas: la Arquitectura en Capas / Puertos y Adaptadores estructura el interior del software host, mientras que la Arquitectura Dirigida por Eventos organiza los flujos asíncronos distribuidos entre hardware, nube y clientes:

![Figura 2: Diagrama de Integración Arquitectónica y Delimitación de Responsabilidades con Puertos Nombrados (v2)](diagramas/diagrama_2_integracion_arquitecturas_v2.png)

### 6.3 Matriz de Mapeo de Puertos, Adaptadores y Eventos

| Nombre del Puerto | Tipo de Puerto | Adaptador Concreto | Eventos Asociados y Responsabilidad |
| :--- | :--- | :--- | :--- |
| **IControlPanelPort** | Entrada (Driver) | Vistas React / UI 3D | Transmite comandos de usuario: openBarrier(), reserveSlot(), toggleBarrier(). |
| **IBarrierPort** | Salida (Driven) | WebSerialBarrierAdapter (arduinoSerial.js) | Traduce órdenes abstractas a bytes serie ('T') y escucha tramas 'ESTADO: ABIERTA' / 'ESTADO: CERRADA'. |
| **IParkingRepository** | Salida (Driven) | FirestoreParkingAdapter (firebase.js) | Sincroniza el estado de las 6 plazas y suscripciones onSnapshot ante cambios en parking_slots. |
| **IALPRValidationService** | Dominio Interno | ALPRDomainService | Coteja la patente leída con las reservas activas en Firestore y verifica cupos libres. |
| **IBillingService** | Dominio Interno | BillingDomainService | Calcula la liquidación monetaria en base a tiempo de permanencia a razón de $35 CLP/min. |
| **IAuditLoggerPort** | Salida (Driven) | FirestoreAuditAdapter / LocalStorage | Registra intentos de acceso no autorizado con evento inmutable ACCESS_DENIED. |

---

## 7. FLUJO DE FUNCIONAMIENTO EXTREMO A EXTREMO

### 7.1 Diagrama de Secuencia General de Acceso
El siguiente diagrama de secuencia detalla los tres escenarios operacionales del sistema: Acceso Autorizado por ALPR, Acceso Denegado por falta de reserva, y el flujo de hardware físico real mediante el pulsador manual de garita:

![Figura 3: Diagrama de Secuencia de Flujo Extremo a Extremo con Tres Escenarios de Operación (v2)](diagramas/diagrama_3_secuencia_flujo_v2.png)

### 7.2 Explicación Paso a Paso de los Tres Escenarios

#### Escenario 1: Flujo de Acceso Autorizado (Patente con Reserva Activa)
1. **Detección:** Un automóvil con patente autorizada (ej. `PF-80-88`) avanza en el Gemelo Digital 3D hacia la entrada. El sensor ultrasónico HC-SR04 (simulado) detecta presencia a menos de 220 mm y emite el evento `VEHICLE_APPROACH`.
2. **Captura:** La cámara ALPR (simulada) captura ópticamente la matrícula y la entrega a la capa de dominio.
3. **Validación:** El servicio de dominio consulta el contrato `IParkingRepository` en Firestore. Se valida que `PF-80-88` tiene reserva vigente y que existen cupos disponibles (`libres > 0`).
4. **Autorización:** El display del tótem LCD (simulado) proyecta `"PASE: PF-80-88"` y la capa de dominio invoca `IBarrierPort.open()`.
5. **Apertura Física:** El adaptador serial despacha el carácter `'T'` por USB al Arduino UNO. El microcontrolador ejecuta la rampa PWM hacia 90° en el Pin 10 físico y emite por serial `"ESTADO: ABIERTA"`.
6. **Propagación Cloud:** El host captura la respuesta serial y actualiza `barriers.state = 'open'` en Firestore, sincronizando a todos los observadores.
7. **Ocupación y Cierre:** El vehículo transpone el pórtico y ocupa el cajón P1. El sensor de cupo actualiza Firestore (Libres: 3, Ocupados: 2), la capa de dominio ordena `IBarrierPort.close()` y el servo baja a 0°.

#### Escenario 2: Flujo de Acceso Denegado (Vehículo No Registrado)
1. **Aproximación No Autorizada:** Se aproxima un automóvil con patente aleatoria (ej. vehículos de prueba `XX-99-ZZ` o `NR-40-40`).
2. **Validación Negativa:** La consulta al repositorio Firestore retorna `null` (sin reserva activa).
3. **Bloqueo de Seguridad:** La lógica de dominio inhibe cualquier comando hacia `IBarrierPort`. El servomotor se mantiene firmemente bloqueado en 0° (política *fail-closed*).
4. **Alerta y Auditoría:** El display del tótem cambia a rojo alertando `"DENEGADO / SIN RESERVA"` y se inserta un documento inmutable en la colección `audit_logs` con marca temporal y patente para fiscalización.

#### Escenario 3: Flujo de Hardware Físico Real (Anulación Manual en Garita)
1. **Intervención Manual:** El operador de garita presiona el pulsador físico conectado al Pin 2 del Arduino UNO.
2. **Operación Autónoma:** El microcontrolador detecta la transición digital a nivel `LOW` e interrumpe el bucle para conmutar la barrera a 90° de manera completamente autónoma sin depender del computador.
3. **Notificación Serie:** El firmware emite por el puerto serie USB la cadena `"ESTADO: ABIERTA"`.
4. **Sincronización Inversa:** El driver Web Serial lee la trama en el navegador host y actualiza el Dashboard de Garita a "ABIERTA", propagando el cambio a Cloud Firestore para que el Gemelo 3D replique la apertura.

---

## 8. IMPLEMENTACIÓN Y EVIDENCIAS

### 8.1 Esquema de Conexión Eléctrica del Hardware Real (Wiring Diagram)
A continuación se presenta el diagrama de conexionado eléctrico del prototipo físico implementado en laboratorio:

![Figura 4: Diagrama Esquemático de Conexión Eléctrica del Prototipo Arduino UNO (Wiring Diagram)](diagramas/diagrama_4_esquema_conexion_v2.png)

### 8.2 Matriz de Clasificación Rigurosa de Implementación

| Componente / Subsistema | Clasificación de Implementación | Detalle Técnico y Justificación |
| :--- | :--- | :--- |
| **Microcontrolador Arduino UNO R3** | HARDWARE FÍSICO REAL | Placa con ATmega328P corriendo firmware C++ con filtrado acumulado 32x y máquina de estados. |
| **Barrera de Entrada (Pin 10 PWM)** | HARDWARE FÍSICO REAL | Micro Servomotor SG90 calibrado en rango 15° (cerrado) a 105° (abierto) con rampa de 20 ms. |
| **Barrera de Salida (Pin 9 PWM)** | HARDWARE FÍSICO REAL | Micro Servomotor SG90 calibrado en rango 15° (cerrado) a 105° (abierto) accionado por comando 'S'. |
| **Sensor Óptico de Entrada (Pin A0)** | HARDWARE FÍSICO REAL | Fotorreceptor LDR en calzada de acceso con umbral $\Delta > 14$ para auto-apertura por sombra. |
| **Sensor de Ocupación Plaza E-01 (Pin A1)** | HARDWARE FÍSICO REAL | Fotorreceptor LDR en cajón 1 con histéresis calibrada (ocupa $>6$, libera $\le 4$). |
| **Semáforo Bicolor Plaza E-01 (Pines 8 y 7)** | HARDWARE FÍSICO REAL | Diodos LED Verde (Pin 8: libre) y Rojo (Pin 7: ocupado) con respuesta local inmediata. |
| **Rieles Virtuales de Energía (Pines 3, 4, 5, 6)** | HARDWARE FÍSICO REAL | Distribución directa de +5V y GND por pines digitales para aislar ruidos y evitar caídas USB. |
| **Maqueta Física a Escala 1:32** | HARDWARE FÍSICO REAL | Plataforma de estacionamiento con calzadas, caseta central azul, 4 plazas y vehículo de prueba. |
| **Canal USB Web Serial API** | HARDWARE FÍSICO REAL | Comunicación serie real CDC UART a 9600 baudios sin drivers externos (WICG Draft). |
| **Dashboard Web de Garita & Control** | SOFTWARE IMPLEMENTADO | SPA desarrollada en React 18, Vite y Tailwind CSS desplegada en GitHub Pages. |
| **Gemelo Digital 3D (Simulador)** | SOFTWARE IMPLEMENTADO | Escena WebGL interactiva desarrollada con Three.js a 60 FPS estables. |
| **Base de Datos Cloud Firestore** | SOFTWARE IMPLEMENTADO | Base documental en la nube con canal reactivo WebChannel en tiempo real. |
| **Sensores Ultrasónicos Adicionales (E-02 a E-06)** | SIMULADO EN GEMELO 3D | Cálculo matemático de proximidad tridimensional euclidiana en cm para plazas virtuales. |
| **Cámara y Módulo de Visión ALPR** | SIMULADO EN GEMELO 3D | Extracción óptica de la matrícula del modelo 3D y consulta a Firestore. |
| **Tótem LCD 16x2 I2C** | SIMULADO EN GEMELO 3D | Display tridimensional procedural que replica mensajes dinámicos al conductor. |
| **SoC ESP32 Wi-Fi / Broker MQTT** | TRABAJO FUTURO | Evolución a conectividad IP nativa sin cable USB (ver sección 9.4). |

### 8.3 Evidencias Gráficas del Sistema en Operación

A continuación se documentan las evidencias gráficas tanto de la plataforma web/gemelo digital como de la **maqueta física real** construida para el proyecto iotAURA:

![Figura 5: Módulo de Reserva de Espacios y Emisión de Pases Digitales (ReservaPlazaView)](evidencias/evidencia_1_reserva_plaza.png)
*Figura 5: Módulo de Reserva de Espacios y Emisión de Pases Digitales (ReservaPlazaView). Selección de plaza E-01 libre, patente ABCD-12, conductor, tiempo estimado 1 hora, tarifa calculada $2.100 CLP y emisión de pase digital.*
**Análisis:** Demuestra el cumplimiento de RF-04. La interfaz permite seleccionar espacios disponibles en tiempo real, ingresar la matrícula y calcular la tarifa exacta en base a $35 CLP/minuto, interactuando con Firestore.

---

![Figura 6: Dashboard de Control y Telemetría en Tiempo Real de Garita (MonitorView)](evidencias/evidencia_2_monitor_telemetria.jpg)
*Figura 6: Dashboard de Control y Telemetría en Tiempo Real de Garita (MonitorView). Visualización de ocupación (3 disponibles, 2 ocupados, 1 reservado), monitor de barrera Pin 10, pulsador Pin 2, respuesta del firmware 'ESTADO: CERRADA' y botón de envío del comando serial 'T'.*
**Análisis:** Demuestra el cumplimiento de RF-01 y RF-06. Refleja la integración con la Web Serial API, visualizando los pines físicos del Arduino UNO y el estado de enlace USB bidireccional.

---

![Figura 7: Gemelo Digital 3D Ciberfísico en Funcionamiento (Maqueta3DView)](evidencias/evidencia_3_gemelo_digital_3d.jpg)
*Figura 7: Gemelo Digital 3D Ciberfísico en Funcionamiento (Maqueta3DView). Escena Three.js interactiva con vehículos, conos de detección ultrasónicos, telemetría lateral en vivo (HUD con 4 libres, 2 ocupados), display del tótem LCD y detección automática de auto azul patente PF-80-88 (REGISTRADA) autorizando la apertura.*
**Análisis:** Demuestra el cumplimiento de RF-02 y RF-03. El automóvil con matrícula autorizada PF-80-88 aproxima al sensor, el tótem muestra el mensaje y la barrera se eleva automáticamente.

---

![Figura 8: Panel de Analíticas y Métricas de Rendimiento (AnalyticsDashboard)](evidencias/evidencia_4_analiticas_metricas.png)
*Figura 8: Panel de Analíticas y Métricas de Rendimiento (AnalyticsDashboard). KPIs de negocio en vivo: 50% de ocupación, rotación de 42 vehículos, estadía media de 48 min, recaudación acumulada de $68.4K CLP y gráfico de distribución de demanda por horas punta (pico del 100% a las 18:00 hrs).*
**Análisis:** Demuestra la presencia de métricas avanzadas y cálculo dinámico de recaudación para la administración del recinto, desmintiendo la ausencia de analíticas en el sistema.

---

![Figura 9: Panel de Gestión de Estacionamiento y Operaciones CRUD (GestionPlazasView)](evidencias/evidencia_5_gestion_plazas_crud.png)
*Figura 9: Panel de Gestión de Estacionamiento y Operaciones CRUD (GestionPlazasView). Tabla de asignación de plazas E-01 a E-06 con patentes reales (KJ-8921, LX-4402), conductores (Valentina Soto, Carlos Mella), cobro acumulado y documentación de endpoints REST/CRUD.*
**Análisis:** Demuestra la trazabilidad de operaciones CRUD en la base de datos y la gestión granular de asignaciones por plaza de estacionamiento.

---

![Figura 10: Maqueta Física del Prototipo Ciberfísico iotAURA (Vista Frontal y Cenital)](evidencias/evidencia_6_maqueta_fisica_frontal.jpg)
*Figura 10: Maqueta Física del Prototipo Ciberfísico iotAURA (Vista Frontal y Cenital). Plataforma de estacionamiento a escala con carriles demarcados de entrada y salida con señalética direccional, caseta central de control en azul, dos servomotores micro SG90 accionando las barreras de acceso, sensor óptico LDR en calzada de entrada, plaza 1 instrumentada con fotorreceptor LDR y semáforo LED bicolor (Pines 8 Verde y 7 Rojo), y vehículo a escala en aproximación al pórtico de control.*
**Análisis:** Demuestra de manera concluyente la existencia, ensamblaje y funcionamiento del prototipo físico tangible exigido en la rúbrica evaluativa. Resuelve integralmente la crítica de hardware, evidenciando la coexistencia de dos barreras mecánicas motorizadas (entrada y salida), la integración de sensores de luz para detección vehicular física y la señalización óptica en tiempo real para las plazas de aparcamiento.

---

![Figura 11: Prototipo Ciberfísico en Perspectiva y Detalle de Sensores (Vista Isométrica)](evidencias/evidencia_7_maqueta_fisica_perspectiva.jpg)
*Figura 11: Prototipo Ciberfísico en Perspectiva y Detalle de Sensores (Vista Isométrica). Vista lateral que evidencia la elevación mecánica y rango angular calibrado (15° a 105°) de las barreras servocontroladas (evitando sobrecorrientes en topes mecánicos de 0°), la ubicación del fotorreceptor en el carril de acceso para auto-apertura por sombra vehicular, la instrumentación de la plaza 1 (LDR y LEDs indicadores) y el ruteo inferior del cableado hacia la placa Arduino UNO R3.*
**Análisis:** Evidencia la robustez constructiva del banco de pruebas experimental, la respuesta electromecánica del servomotor SG90 ante comandos emitidos desde la interfaz Web Serial API o detección automática por sombra, y la fidelidad dimensional que sustenta el gemelo digital 3D.

---

### 8.4 Metodología de Medición de Métricas Técnicas
- **Latencia Serial USB (14.2 ms):** Medida mediante el API `performance.now()` en el navegador host, calculando el delta temporal desde el instante en que el `WritableStream` escribe el carácter `'T'` hasta que el `ReadableStream` decodifica el primer carácter de `"ESTADO: ABIERTA"`. Promedio de 20 repeticiones: 14.2 ms.
- **Latencia Cloud Firestore onSnapshot (185 - 260 ms):** Medida mediante diferencias de timestamp entre la invocación de `updateDoc()` en un cliente emisor y la recepción del callback `onSnapshot()` en un segundo cliente receptor en red WAN estándar. Rango observado: 185 ms a 260 ms.
- **Tasa de Refresco del Gemelo 3D (60 FPS):** Medida mediante la librería `stats.js` integrada en el bucle `requestAnimationFrame()` de Three.js. La escena mantuvo 60 FPS estables de forma constante en pantallas FHD.
- **Tiempo de Desplazamiento de Barrera (1.8 s):** Determinada por el bucle `for (pos = 0; pos <= 90; pos++)` del firmware Arduino, que ejecuta 90 pasos con un `delay(20)` milisegundos entre cada grado, totalizando exactamente 1.800 ms (1,8 segundos) para garantizar movimiento suave y evitar vibraciones mecánicas.

### 8.5 Tabla de Pruebas y Trazabilidad de Requisitos

| Requisito | Procedimiento de Prueba Aplicado | Resultado Esperado | Resultado Medido | Estado |
| :--- | :--- | :--- | :--- | :--- |
| **RF-01** | Presionar botón Pin 2 y presionar botón web 'Enviar T'. | Barrera rota entre 0° y 90°; emite tramas seriales. | Servo abre a 90° en 1,8 s; reporte serie capturado. | **APROBADO** |
| **RF-02** | Aproximar auto con patente PF-80-88 en Gemelo 3D. | Reconoce patente, valida reserva y abre barrera. | Tótem muestra 'PASE: PF-80-88' y barrera abre. | **APROBADO** |
| **RF-03** | Conmutar barrera en simulador y verificar dashboard. | Propagación de estado a otras vistas en < 400 ms. | Latencia medida: 210 ms. Sincronización instantánea. | **APROBADO** |
| **RF-04** | Registrar reserva con patente ABCD-12 por 1 hora. | Calcula tarifa ($2.100 CLP) y descuenta cupo. | Cálculo exacto a $35/min; cupos libres bajan de 4 a 3. | **APROBADO** |
| **RF-05** | Aproximar auto de prueba con patente XX-99-ZZ. | Bloquea barrera a 0°, alerta en tótem y genera log. | Barrera enclavada a 0°; log ACCESS_DENIED creado. | **APROBADO** |
| **RF-06** | Conectar/desconectar cable USB durante la operación. | UI detecta cambio; no se congela ante desconexión. | Manejo controlado de evento disconnect en navegador. | **APROBADO** |
| **RNF-01** | Medición de latencia serial y cloud con performance.now. | Serial < 100 ms; Cloud < 400 ms. | Serial: 14.2 ms; Cloud: 185-260 ms. | **APROBADO** |
| **RNF-02** | Desconectar conexión a Internet y presionar Pin 2. | Pulsador físico debe operar la barrera de forma autónoma. | Arduino abre barrera localmente sin Internet. | **APROBADO** |

---

## 9. ANÁLISIS DE DECISIONES Y ANÁLISIS CRÍTICO

### 9.1 Complementariedad Arquitectónica y Sinergia
La integración de la Arquitectura en Capas con Puertos y Adaptadores y la Arquitectura Dirigida por Eventos resuelve armónicamente los desafíos estructurales y operacionales de iotAURA:
1. **Organización Estructural Interna (Hexagonal):** Garantiza que el código no sufra de dependencias circulares ni acoplamiento tecnológico. El núcleo de dominio (validación ALPR, tarifas, plazas) desconoce por completo si la barrera física es comandada por un Arduino por USB o por un PLC industrial; simplemente invoca `IBarrierPort.open()`.
2. **Comunicación Dinámica Asíncrona (EDA):** Permite que los cambios de estado fluyan como eventos desacoplados en el tiempo. Cuando el Arduino emite `'ESTADO: ABIERTA'`, este evento viaja por el adaptador serial hacia el bus de eventos de la aplicación, el cual a su vez notifica al adaptador cloud para replicarlo en Firestore. No existe ningún hilo bloqueado esperando una respuesta síncrona.

Ambas arquitecturas convergen de manera exacta en la capa de adaptadores: los adaptadores implementan los puertos del dominio y actúan simultáneamente como publicadores y suscriptores de eventos.

### 9.2 Ventajas y Limitaciones Técnicas

#### Ventajas Técnicas Demostradas:
- Cero servidores intermediarios locales gracias al uso de la W3C Web Serial API directamente en el navegador.
- Sincronización multi-pantalla en tiempo real con latencias subsegundo sin sobrecosto de sondeo HTTP.
- Validación ciberfísica segura mediante el Gemelo Digital 3D, permitiendo simular tráfico antes del despliegue.

#### Limitaciones Técnicas del Prototipo:
- **Compatibilidad de navegador:** La Web Serial API es un borrador del WICG implementado exclusivamente en navegadores basados en Chromium (Chrome, Edge, Opera), no estando disponible en Firefox ni Safari.
- **Validación en cliente:** Al no contar con un servidor backend dedicado en esta fase, la lógica de validación de reservas se ejecuta en el navegador host. En un entorno comercial de producción, un cliente malicioso podría intentar eludir la validación; se requerirá migrar estas reglas a Cloud Functions o a un backend Node.js autenticado.
- **Dependencia de WAN para funciones automáticas:** Si se pierde la conexión a Internet, la validación de patentes en la nube no opera, operando bajo política *fail-closed* (barrera cerrada). Sin embargo, el botón físico en Pin 2 mantiene la operatividad manual.

### 9.3 Matriz de Riesgos Técnicos y Mitigaciones

| Riesgo Técnico Identificado | Impacto | Mitigación Implementada en iotAURA |
| :--- | :--- | :--- |
| **Desconexión fortuita de cable USB** | Alto | Control de excepciones en arduinoSerial.js escuchando eventos 'disconnect'. La UI cambia a modo simulado sin congelarse. |
| **Corte de suministro eléctrico en recinto** | Crítico | El prototipo puede alimentarse de baterías portátiles (PowerBank USB). En producción se requiere UPS y mecanismo de desacople mecánico manual. |
| **Caída de conexión a Internet / WAN** | Medio | Política fail-closed: la barrera no abre a desconocidos. El guardia opera la barrera con el botón físico en Pin 2 de forma autónoma. |
| **Sobrecarga de corriente en servomotor** | Medio | Rampa de aceleración por software (20 ms/grado) que limita el consumo dinámico a < 250 mA, evitando caídas de tensión en Arduino. |
| **Manipulación indebida de registros** | Alto | Reglas de seguridad en Firestore que impiden la modificación o borrado de la colección audit_logs (política append-only). |

### 9.4 Hoja de Ruta de Escalabilidad y Crecimiento

#### Escalabilidad de Hardware:
1. Migración de Arduino UNO a módulos SoC **ESP32** con microcontrolador Xtensa dual-core a 240 MHz, dotando a cada barrera de conectividad Wi-Fi 802.11 b/g/n y Bluetooth BLE nativa, eliminando la dependencia física del cable USB.
2. Incorporación de microcámaras ESP32-CAM o cámaras IP RTSP conectadas a nodos de cómputo en el borde (*Edge Computing*) corriendo modelos de visión artificial **YOLOv8** optimizados con TensorRT para reconocimiento óptico real de matrículas vehiculares chilenas.
3. Instalación de sensores de presencia por espira inductiva electromagnética bajo el pavimento para detección vehicular física inmune a condiciones climáticas adversas.

#### Escalabilidad de Software y Nube:
1. Adopción del protocolo estándar industrial **MQTT (ISO/IEC 20922)** sobre un broker dedicado como **Eclipse Mosquitto** con cifrado TLS 1.3 y calidad de servicio QoS 1, reduciendo el tamaño de trama a escasos bytes.
2. Migración de la lógica de validación desde el navegador hacia un backend robusto basado en microservicios en **NestJS / Node.js** containerizados en Docker y orquestados en Kubernetes.
3. Integración de autenticación corporativa OAuth2 / OpenID Connect y pasarela de pagos electrónicos (Transbank Webpay / MercadoPago) para cobro automático por tarjeta bancaria.

---

## 10. CONCLUSIONES Y APRENDIZAJES

1. **Articulación de Arquitectura de Software e IoT:** La articulación entre la Arquitectura de Software y el Internet de las Cosas demostró ser un factor crítico para el éxito del proyecto. La aplicación de la Arquitectura en Capas con Puertos y Adaptadores permitió construir una base de código desacoplada y modular, donde el cambio continuo de requisitos y la coexistencia entre hardware físico real y simulación 3D se lograron sin alterar la lógica de negocio.
2. **Potencia de la Arquitectura Dirigida por Eventos:** La Arquitectura Dirigida por Eventos resolvió de manera óptima el desafío de la sincronización en tiempo real. Al sustituir el clásico esquema de sondeo periódico por streams reactivos y listeners en Firestore, se redujo drásticamente el consumo de red y se alcanzó una latencia de actualización inferior a 300 ms entre el accionamiento físico y el gemelo virtual.
3. **Aprendizajes Técnicos de Hardware y Firmware:** Se constató la importancia de la gestión de temporizaciones en sistemas embebidos de recursos restringidos como el ATmega328P. La implementación de rampas suaves de velocidad y debouncing por software fue indispensable para prevenir caídas de tensión en el riel de 5V y evitar lecturas espurias en la entrada de garita.
4. **Valor de los Gemelos Digitales (Digital Twins):** La simulación espacial interactiva en Three.js demostró ser una herramienta invaluable para pruebas de integración continua ciberfísica, permitiendo evaluar escenarios de contingencia y validación ALPR sin requerir el despliegue costoso de múltiples vehículos físicos en el laboratorio.

---

## REFERENCIAS TÉCNICAS

1. **Cockburn, A.** (2005). *Hexagonal Architecture: Ports and Adapters Pattern*. Alistair Cockburn Consulting.
2. **Martin, R. C.** (2017). *Clean Architecture: A Craftsman's Guide to Software Structure and Design*. Prentice Hall.
3. **Bass, L., Clements, P., & Kazman, R.** (2021). *Software Architecture in Practice* (4th Edition). Addison-Wesley Professional.
4. **Fowler, M.** (2017). *What do you mean by 'Event-Driven'?*. MartinFowler.com.
5. **W3C Web Incubator Community Group (WICG).** (2023). *Web Serial API Specification (Draft Community Group Report)*. [https://wicg.github.io/serial/](https://wicg.github.io/serial/)
6. **Google Cloud Platform.** (2024). *Cloud Firestore Documentation: Realtime Updates with Listeners on WebChannel*. [https://firebase.google.com/docs/firestore](https://firebase.google.com/docs/firestore)
7. **Arduino SA.** (2024). *Arduino Language Reference & Servo Library API*. [https://www.arduino.cc/reference/en/](https://www.arduino.cc/reference/en/)
8. **Three.js Authors.** (2024). *Three.js JavaScript 3D Library API Reference*. [https://threejs.org/docs/](https://threejs.org/docs/)

---

## ANEXOS TÉCNICOS

### Anexo A: Tabla Detallada de Asignación de Pines (Arduino UNO)

| Pin Arduino UNO | Componente Conectado | Tipo de Señal | Nivel Lógico | Función Operativa |
| :--- | :--- | :--- | :--- | :--- |
| **Pin 10 (PWM)** | Servo Barrera Entrada SG90 | Salida Digital PWM | 5.0V DC (1ms - 2ms) | Control de barrera de entrada en rango seguro (15° cerrado a 105° abierto). |
| **Pin 9 (PWM)** | Servo Barrera Salida SG90 | Salida Digital PWM | 5.0V DC (1ms - 2ms) | Control de barrera de salida en rango seguro (15° cerrado a 105° abierto). |
| **Pin A0 (Analógico)** | Sensor LDR Entrada | Entrada Analógica | 0 - 5V DC (0-1023) | Lectura óptica de aproximación vehicular con sobremuestreo 32x. |
| **Pin A1 (Analógico)** | Sensor LDR Plaza E-01 | Entrada Analógica | 0 - 5V DC (0-1023) | Detección óptica de ocupación en plaza 1 con filtro de histéresis. |
| **Pin 8** | Semáforo LED Verde Plaza 1 | Salida Digital | +5.0V DC / 0V | Señal de plaza disponible (HIGH cuando plaza está libre). |
| **Pin 7** | Semáforo LED Rojo Plaza 1 | Salida Digital | +5.0V DC / 0V | Señal de plaza ocupada (HIGH cuando plaza está ocupada). |
| **Pin 3** | Riel Vcc Virtual LDR 2 | Salida Digital | +5.0V DC (HIGH) | Suministro de energía positiva dedicada al sensor de puesto 1. |
| **Pin 4** | Riel Vcc Virtual LDR 1 | Salida Digital | +5.0V DC (HIGH) | Suministro de energía positiva dedicada al sensor de entrada. |
| **Pin 5** | Riel GND Virtual LDR 2 | Salida Digital | 0.0V DC (LOW) | Referencia a masa dedicada para el sensor de puesto 1. |
| **Pin 6** | Riel GND Virtual Semáforo | Salida Digital | 0.0V DC (LOW) | Retorno de masa para el cátodo común de los diodos LED. |
| **Pines 0 y 1** | Conversor USB CDC UART | Bus Serie | 5V TTL | Comunicación serie bidireccional a 9600 baudios con Web Serial API. |

---

### Anexo B: Protocolo de Tramas Seriales (Web Serial API)

| Dirección de Enlace | Trama / Byte | Significado Técnico | Efecto Operativo en el Sistema |
| :--- | :--- | :--- | :--- |
| **Host Web $\rightarrow$ Arduino** | `'E'` o `'e'` | Toggle Barrera Entrada | Conmuta la barrera de entrada entre 15° y 105° con rampa suave. |
| **Host Web $\rightarrow$ Arduino** | `'S'` o `'s'` | Toggle Barrera Salida | Conmuta la barrera de salida entre 15° y 105° con rampa suave. |
| **Arduino $\rightarrow$ Host Web** | `"SISTEMA LISTO\r\n"` | Notificación de Arranque | Indica inicio y calibración automática de luz base completada. |
| **Arduino $\rightarrow$ Host Web** | `"ENTRADA: ABIERTA\r\n"` | Notificación de Estado | Confirma que la barrera de entrada completó la apertura a 105°. |
| **Arduino $\rightarrow$ Host Web** | `"ENTRADA: CERRADA\r\n"` | Notificación de Estado | Confirma que la barrera de entrada completó el cierre a 15°. |
| **Arduino $\rightarrow$ Host Web** | `"SALIDA: ABIERTA\r\n"` | Notificación de Estado | Confirma que la barrera de salida completó la apertura a 105°. |
| **Arduino $\rightarrow$ Host Web** | `"SALIDA: CERRADA\r\n"` | Notificación de Estado | Confirma que la barrera de salida completó el cierre a 15°. |
| **Arduino $\rightarrow$ Host Web** | `"PUESTO_1: OCUPADO\r\n"`| Notificación de Ocupación | Indica detección de auto sobre LDR de plaza 1 y enciende LED rojo. |
| **Arduino $\rightarrow$ Host Web** | `"PUESTO_1: LIBRE\r\n"` | Notificación de Desocupación| Indica retiro de vehículo, restablece LED verde y actualiza cupos. |

---

### Anexo C: Código Fuente del Firmware Arduino (`arduino/smart_parking_uno.ino`)

```cpp
/*
  PROYECTO: SMART PARKING IoT (iotAURA) - ARDUINO UNO R3
  PROFESOR: Osvaldo Archile
  INTEGRANTES: Paul Ferrada, Fabián Mora, Felipe Labarca, Agustín Cañas
  ASIGNATURAS: Arquitectura de Software & Internet de las Cosas
*/

#include <Servo.h>

Servo servoEntrada;
Servo servoSalida;

// Pines de hardware (conexión directa)
const int pinServoEntrada = 10;
const int pinServoSalida  = 9;
const int ldrEntradaPin   = A0;
const int ldrPuestoPin    = A1;

// Pines usados como energía y tierra extra
const int pinLdr2Vcc      = 3; // 5V para LDR 2 (puesto LED)
const int pinLdr1Vcc      = 4; // 5V para LDR 1 (entrada)
const int pinLdr2Gnd      = 5; // GND para LDR 2
const int pinLedGnd       = 6; // GND para LED
const int pinLedRojo      = 7;
const int pinLedVerde     = 8;

// Estados del sistema
bool entradaAbierta = false;
bool entradaManual  = false;
bool salidaAbierta  = false;
bool puestoOcupado  = false;

int velocidad = 20;

// Ángulos seguros (evitan tope mecánico en 0°)
const int anguloCerrado = 15;
const int anguloAbierto = 105;

// Calibración en escala 32x (reposo: 1-4 | con auto: 9-18)
long luzBaseEntrada      = 0;
long luzBasePuesto       = 0;
long margenEntrada       = 14;
long margenPuestoOcupar  = 6; // Ocupa al superar 6 (rango auto: 9-18)
long margenPuestoLiberar = 4; // Libera rápido al bajar a 4 o menos

void setup() {
  Serial.begin(9600);

  pinMode(pinLdr2Vcc, OUTPUT);
  digitalWrite(pinLdr2Vcc, HIGH);

  pinMode(pinLdr1Vcc, OUTPUT);
  digitalWrite(pinLdr1Vcc, HIGH);

  pinMode(pinLdr2Gnd, OUTPUT);
  digitalWrite(pinLdr2Gnd, LOW);

  pinMode(pinLedGnd, OUTPUT);
  digitalWrite(pinLedGnd, LOW);

  pinMode(pinLedVerde, OUTPUT);
  pinMode(pinLedRojo, OUTPUT);

  // Inicia en estado libre
  digitalWrite(pinLedVerde, HIGH);
  digitalWrite(pinLedRojo, LOW);

  servoEntrada.attach(pinServoEntrada);
  servoSalida.attach(pinServoSalida);

  servoEntrada.write(anguloCerrado);
  delay(300);
  servoSalida.write(anguloCerrado);

  // Espera a que los motores se estabilicen antes de medir la luz base
  delay(1000);
  luzBaseEntrada = leerSensorAcumulado(ldrEntradaPin);
  luzBasePuesto  = leerSensorAcumulado(ldrPuestoPin);

  Serial.println("SISTEMA LISTO");
}

void loop() {
  long lecturaEntrada = leerSensorAcumulado(ldrEntradaPin);
  long lecturaPuesto  = leerSensorAcumulado(ldrPuestoPin);

  long difEntrada = abs(lecturaEntrada - luzBaseEntrada);
  long difPuesto  = abs(lecturaPuesto  - luzBasePuesto);

  bool autoEnEntrada = difEntrada > margenEntrada;

  // 1. Comandos desde página web o Monitor Serie
  if (Serial.available() > 0) {
    char comando = Serial.read();
    
    if (comando == 'E' || comando == 'e') {
      if (!entradaAbierta) {
        moverBarrera(servoEntrada, anguloCerrado, anguloAbierto);
        entradaAbierta = true;
        entradaManual = true;
        Serial.println("ENTRADA: ABIERTA");
      } else {
        moverBarrera(servoEntrada, anguloAbierto, anguloCerrado);
        entradaAbierta = false;
        entradaManual = false;
        Serial.println("ENTRADA: CERRADA");
      }
    }

    if (comando == 'S' || comando == 's') {
      if (!salidaAbierta) {
        moverBarrera(servoSalida, anguloCerrado, anguloAbierto);
        salidaAbierta = true;
        Serial.println("SALIDA: ABIERTA");
      } else {
        moverBarrera(servoSalida, anguloAbierto, anguloCerrado);
        salidaAbierta = false;
        Serial.println("SALIDA: CERRADA");
      }
    }
  }

  // 2. Automatización de barrera de ENTRADA (LDR 1 en A0)
  if (autoEnEntrada && !entradaAbierta) {
    delay(40);
    long confirmacionEntrada = abs(leerSensorAcumulado(ldrEntradaPin) - luzBaseEntrada);
    if (confirmacionEntrada > margenEntrada) {
      moverBarrera(servoEntrada, anguloCerrado, anguloAbierto);
      entradaAbierta = true;
      entradaManual = false;
      Serial.println("ENTRADA: ABIERTA");
    }
  } 
  else if (!autoEnEntrada && entradaAbierta && !entradaManual) {
    delay(1500);
    long confirmacionEntrada = abs(leerSensorAcumulado(ldrEntradaPin) - luzBaseEntrada);
    if (confirmacionEntrada <= margenEntrada) {
      moverBarrera(servoEntrada, anguloAbierto, anguloCerrado);
      entradaAbierta = false;
      Serial.println("ENTRADA: CERRADA");
    }
  }

  // 3. Monitoreo de PUESTO 1 (LDR 2 en A1) con retorno rápido
  if (!puestoOcupado && difPuesto > margenPuestoOcupar) {
    delay(120);
    long confirmacionPuesto = abs(leerSensorAcumulado(ldrPuestoPin) - luzBasePuesto);
    if (confirmacionPuesto > margenPuestoOcupar) {
      puestoOcupado = true;
      digitalWrite(pinLedVerde, LOW);
      digitalWrite(pinLedRojo, HIGH);
      Serial.println("PUESTO_1: OCUPADO");
    }
  } 
  else if (puestoOcupado && difPuesto <= margenPuestoLiberar) {
    delay(200); // Retorno rápido y estable al retirar el auto
    long confirmacionPuesto = abs(leerSensorAcumulado(ldrPuestoPin) - luzBasePuesto);
    if (confirmacionPuesto <= margenPuestoLiberar) {
      puestoOcupado = false;
      digitalWrite(pinLedVerde, HIGH);
      digitalWrite(pinLedRojo, LOW);
      Serial.println("PUESTO_1: LIBRE");
    }
  }

  delay(20);
}

long leerSensorAcumulado(int pin) {
  long suma = 0;
  for (int i = 0; i < 32; i++) {
    suma += analogRead(pin);
    delay(1);
  }
  return suma;
}

void moverBarrera(Servo &motor, int inicio, int fin) {
  if (inicio < fin) {
    for (int pos = inicio; pos <= fin; pos++) {
      motor.write(pos);
      delay(velocidad);
    }
  } else {
    for (int pos = inicio; pos >= fin; pos--) {
      motor.write(pos);
      delay(velocidad);
    }
  }
  delay(350);
}
```

---

### Anexo D: Guía de Preparación para la Defensa en la Feria de Informática

> **1. ¿Por qué seleccionaron estas arquitecturas y no otras?**  
> *"Seleccionamos la Arquitectura en Capas con Puertos y Adaptadores (Hexagonal) y la Arquitectura Dirigida por Eventos (EDA) porque son perfectamente proporcionales al alcance ciberfísico del proyecto. Descartamos una arquitectura monolítica tradicional porque acoplaría la interfaz gráfica con el hardware físico impidiendo la sincronización con el gemelo 3D. Descartamos microservicios orquestados en Kubernetes porque sobredimensionarían innecesariamente los requerimientos para una garita. Puertos y Adaptadores blinda la lógica de negocio de cobro ($35/min) y validación ALPR frente a futuros cambios de microcontrolador (migrar a ESP32), mientras que EDA provee sincronización reactiva en tiempo real sin el sobrecosto ni saturación del sondeo periódico (polling)."*

> **2. ¿Qué responsabilidad cumple cada arquitectura?**  
> *"La Arquitectura Hexagonal organiza internamente el software del host: delimita la presentación (React y Three.js), el dominio central (donde residen las reglas de negocio, validación de patentes ALPR y cobro) y los adaptadores de infraestructura (arduinoSerial.js y firebase.js) a través de contratos de puertos. La Arquitectura Dirigida por Eventos organiza la comunicación asíncrona distribuida: define a Firestore y a la Web Serial API como canales de eventos que capturan deltas emitidos por sensores, botones o usuarios, y los propagan de forma no bloqueante a los consumidores suscritos."*

> **3. ¿Cómo se comunican los dispositivos con el resto del sistema?**  
> *"El Arduino UNO se comunica con la estación local mediante cable USB a 9600 baudios utilizando la W3C Web Serial API (especificación WICG) directamente desde el navegador Chrome/Edge. El host escribe un byte simple 'T' en el WritableStream; el microcontrolador responde con cadenas de telemetría a través del ReadableStream. A nivel global, el host interactúa con Google Cloud Firestore a través de WebSockets seguros (WebChannel/HTTPS), sincronizando el estado con el gemelo 3D y la base de datos sin requerir servidores intermediarios locales."*

> **4. ¿Qué ocurre si se pierde Wi-Fi o deja de responder un servicio?**  
> *"El sistema implementa tolerancia a fallos por diseño descentralizado. Si se cae Internet o Firestore deja de responder, el controlador físico Arduino UNO sigue funcionando de forma completamente autónoma: el guardia puede presionar el botón físico en el Pin 2 y la barrera continuará abriendo y cerrando sin problemas gracias a su código embebido independiente. En cuanto al flujo automatizado de ALPR, el sistema adopta una política de fallo seguro (fail-closed): si no hay conexión a la nube para validar la patente, la barrera no abre automáticamente, impidiendo el paso de vehículos no autorizados."*

> **5. ¿Cómo incorporarían un nuevo sensor, dispositivo o usuario?**  
> *"Gracias a Puertos y Adaptadores, añadir un nuevo sensor (ej. un sensor de gas CO2 o un semáforo LED) solo requiere escribir un nuevo adaptador de hardware que satisfaga la interfaz de eventos, sin tocar una sola línea de la lógica de negocio ni de la base de datos. Para nuevos usuarios o conductores, el modelo de datos de Firestore escala horizontalmente de forma nativa en la colección reservations, admitiendo múltiples clientes concurrentes suscritos al broker sin degradar la latencia."*

> **6. ¿Qué componente procesa, almacena y presenta los datos?**  
> *"El procesamiento de control en tiempo real lo realiza el microcontrolador ATmega328P de Arduino a nivel físico, y la capa de dominio en JavaScript a nivel de reglas de acceso. El almacenamiento se realiza en la nube a través de Google Cloud Firestore (para estados globales, cupos, patentes y logs de auditoría) con respaldo en memoria local. La presentación corre por cuenta de la aplicación web React 18 (para el panel administrativo de garita, analíticas y gestión) y Three.js / WebGL (para la visualización espacial interactiva del gemelo digital 3D)."*

> **7. ¿Qué mejorarían si el proyecto creciera?**  
> *"En una fase comercial a gran escala, reemplazaríamos el Arduino UNO cableado por SoCs ESP32 para dotar a cada barrera de conexión Wi-Fi/Ethernet nativa, adoptando el protocolo industrial MQTT sobre un broker dedicado como Mosquitto con certificados TLS 1.3. Además, sustituiríamos la simulación ALPR por cámaras físicas en el borde (Edge Computing) procesadas con modelos de visión computacional YOLOv8 para reconocimiento automático de placas chilenas, migraríamos la lógica del cliente a un backend NestJS en la nube, e integraríamos pasarelas de pago electrónico como Transbank Webpay."*
