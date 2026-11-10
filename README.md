# iotAURA · Smart Parking IoT & Monitor de Maqueta

Sistema de monitoreo, control de acceso y telemetría en tiempo real para maqueta física de estacionamiento inteligente de 6 plazas, desarrollado para el ramo de **Internet de las Cosas (IoT)**.

![iotAURA Status](https://img.shields.io/badge/Status-Online-success?style=flat-square)
![Hardware](https://img.shields.io/badge/Hardware-Arduino%20UNO%20R3-00979D?style=flat-square)
![Database](https://img.shields.io/badge/Database-Firebase%20Firestore-FFCA28?style=flat-square)
![Frontend](https://img.shields.io/badge/Frontend-React%20%2B%20Tailwind%20%2B%20Vite-61DAFB?style=flat-square)

---

## 👥 Equipo de Desarrollo
- **Paul Ferrada**
- **Fabián Mora**
- **Felipe Labarca**
- **Agustín Cañas**

---

## 🚀 Despliegue en GitHub Pages
La aplicación se encuentra lista para ejecutarse y desplegarse automáticamente en GitHub Pages mediante GitHub Actions:
- **URL de GitHub Pages:** `https://PaulFL808.github.io/iotAURA/`

---

## 🎯 Características Principales

### 1. Control de Barreras desde la Web
- **Apertura manual (90°)** y **cierre manual (0°)** de las barreras de **Entrada** y **Salida** directamente desde el dashboard.
- Servomotores **SG90** controlados mediante pulsos PWM desde Arduino UNO (Pines 9 y 10).
- Animación interactiva en pantalla y sincronización en vivo con la base de datos **Firebase Firestore**.

### 2. Base de Datos en Tiempo Real (Firebase Cloud Firestore)
- Proyecto Firebase: `iotaura` (`iotaura.firebaseapp.com`).
- Sincronización instantánea de:
  - Colección `parking_slots`: Estado de las 6 plazas (distancia HC-SR04, ocupado/libre/reservado, patente, conductor).
  - Documento `system_state/barriers`: Estado y ángulo de barreras de acceso.
  - Colección `audit_logs`: Registro histórico de eventos de sensores y comandos de operador.
  - Colección `reservations`: Pase digital de reservas con código QR.

### 3. Integración con Arduino UNO (Web Serial API)
- Conexión USB directa desde el navegador (Google Chrome o Microsoft Edge) al Arduino UNO a **9600 baudios**.
- Sin necesidad de instalar servidores locales intermediarios durante la presentación de la maqueta: el navegador se comunica bidireccionalmente con el microcontrolador.
- Bucle de telemetría periódica en formato JSON:
  ```json
  {"type":"TELEMETRY","slots":[{"id":1,"dist":45.2,"occ":false}, ...]}
  ```
- Consola Serial en vivo integrada en el encabezado de la web para auditoría técnica.

### 4. Hardware de la Maqueta
- **Microcontrolador:** Arduino UNO R3 (ATmega328P).
- **Sensores de Plaza:** 6 Sensores Ultrasónicos HC-SR04 (disparo común Pin 2, Echo Pines 3 al 8).
- **Sensores de Acceso:** 2 Sensores Ultrasónicos (Entrada Pin A1, Salida Pin A2, Trig Pin A0).
- **Actuadores:** 2 Servomotores TowerPro SG90 (Entrada Pin 9, Salida Pin 10).
- **Pantalla:** LCD 16x2 con interfaz I2C (Dirección `0x27`, pines SDA A4 / SCL A5).

---

## 📁 Estructura del Proyecto

```
iotAURA/
├── .github/
│   └── workflows/
│       └── deploy.yml            # Pipeline CI/CD para GitHub Pages
├── arduino/
│   └── smart_parking_uno.ino     # Código para Arduino UNO R3
├── public/                       # Recursos estáticos
├── src/
│   ├── components/
│   │   ├── Header.jsx            # Barra superior con estado de BD y Arduino
│   │   ├── MaquetaView.jsx       # Vista 2D interactiva, control de barreras y plazas
│   │   ├── ReservationTerminal.jsx # Terminal de reserva y generación QR
│   │   ├── CrudOperations.jsx    # Gestión CRUD para administración
│   │   ├── AnalyticsDashboard.jsx# Métricas y logs de auditoría
│   │   └── ArchitectureDefense.jsx # Ficha técnica y arquitectura del sistema
│   ├── services/
│   │   ├── arduinoSerial.js      # Driver Web Serial API (USB 9600 baud)
│   │   ├── firebase.js           # Conector Cloud Firestore (iotaura)
│   │   ├── api.js                # Respaldo API REST local / fallback
│   │   └── auth.js               # Control de roles y perfiles
│   ├── App.jsx                   # Componente raíz y orquestador
│   ├── main.jsx                  # Punto de entrada Vite
│   └── index.css                 # Estilos Tailwind CSS
├── .env                          # Variables de configuración Firebase
├── package.json                  # Dependencias y scripts
└── vite.config.js                # Configuración de compilación Vite (base relative)
```

---

## 🛠️ Comandos de Ejecución Local

1. **Instalar dependencias:**
   ```bash
   npm install
   ```

2. **Iniciar servidor de desarrollo Vite:**
   ```bash
   npm run dev
   ```
   Abre [http://localhost:3000](http://localhost:3000) en Google Chrome o Microsoft Edge.

3. **Compilar para producción:**
   ```bash
   npm run build
   ```

---

## 🔌 Carga del Sketch en Arduino

1. Abre el archivo `arduino/smart_parking_uno.ino` en **Arduino IDE**.
2. Conecta tu Arduino UNO por cable USB a la computadora.
3. Asegúrate de tener instalada la librería `LiquidCrystal_I2C`.
4. Selecciona la placa **Arduino Uno** y el puerto COM asignado.
5. Haz clic en **Subir (Upload)**.
6. Abre la página web en Chrome/Edge, haz clic en **"Conectar Arduino (USB)"**, selecciona el puerto COM y ¡listo! Las barreras y sensores responderán en tiempo real.
