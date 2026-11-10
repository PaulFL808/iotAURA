/*
  =============================================================================
  PROYECTO: SMART PARKING IoT (iotAURA) - ARDUINO UNO R3
  ASIGNATURA: Ramo IoT
  INTEGRANTES:
    - Paul Ferrada
    - Fabián Mora
    - Felipe Labarca
    - Agustín Cañas

  DESCRIPCIÓN DE HARDWARE (CONEXIONES FÍSICAS):
    - Servomotor de Barrera: Pin 9 (PWM)
    - Botón Pulsador de Acceso: Pin 2 (INPUT_PULLUP)
    - Pantalla Display 7 Segmentos x 4 Dígitos (SevSeg):
        * Dígitos: Pines 10, 11, 12, 13
        * Segmentos: Pines 3, 4, 5, 6, 7, 8, A0, A1 (A1 relleno decimal)
    - Comunicación Serial USB: Pines 0 (RX) y 1 (TX) a 9600 baudios
      conecta directamente al navegador vía Web Serial API (Chrome / Edge)
  =============================================================================
*/

#include <Servo.h>
#include <SevSeg.h>

Servo barrera;       
SevSeg pantalla;     

// Pin del Botón físico en protoboard
const int pinBoton = 2;    
int estadoBotonAnterior = HIGH;    
unsigned long ultimoTiempoBoton = 0;

// Contadores del estacionamiento
int libres = 14;
int ocupados = 0;

// Variables para el movimiento suave del servomotor
bool barreraAbierta = false;       
int posicionActual = 0;
int posicionDestino = 0;
unsigned long tiempoAnteriorServo = 0;
int velocidadServo = 20; // Milisegundos por grado (20 = suave y realista)

// Control de telemetría periódica por Serial (sin bloquear pantalla)
unsigned long ultimoTiempoTelemetria = 0;
const unsigned long INTERVALO_TELEMETRIA = 1000; // Enviar datos cada 1 segundo

// Buffer para lectura serial no bloqueante
char serialBuffer[32];
byte serialIndex = 0;

void setup() {
  // 1. Iniciar comunicación Serial a 9600 baudios para enlace con iotAURA Web
  Serial.begin(9600);

  // 2. Configuración del servomotor y botón
  barrera.attach(9); 
  barrera.write(posicionActual);  
  pinMode(pinBoton, INPUT_PULLUP); 

  // 3. Configuración de la Pantalla 7 Segmentos x 4 Dígitos
  byte numDigits = 4;
  byte digitPins[] = {10, 11, 12, 13}; 
  byte segmentPins[] = {3, 4, 5, 6, 7, 8, A0, A1}; 
  
  bool resistorsOnSegments = false; 
  byte hardwareConfig = COMMON_CATHODE; // Si se ve raro, cambiar a COMMON_ANODE
  
  bool updateWithDelays = false;
  bool leadingZeros = true; // "0014" (Ocupados 00, Libres 14)
  bool disableDecPoint = true;

  pantalla.begin(hardwareConfig, numDigits, digitPins, segmentPins, resistorsOnSegments,
                 updateWithDelays, leadingZeros, disableDecPoint);
  pantalla.setBrightness(90);

  // Mensaje inicial de confirmación a la página web
  Serial.println("{\"type\":\"SYSTEM\",\"status\":\"READY\",\"project\":\"iotAURA\",\"team\":\"Paul, Fabian, Felipe, Agustin\"}");
}

// Función para abrir la barrera (usada por botón físico y por la web)
void abrirBarrera() {
  posicionDestino = 90;
  barreraAbierta = true;
  
  // Notificar inmediatamente a la web por Serial
  Serial.print("{\"event\":\"BARRIER_ENTRY_OPEN\",\"status\":\"open\",\"angle\":90,\"libres\":");
  Serial.print(libres);
  Serial.print(",\"ocupados\":");
  Serial.print(ocupados);
  Serial.println("}");
}

// Función para cerrar la barrera (usada por botón físico y por la web)
void cerrarBarrera() {
  posicionDestino = 0;
  barreraAbierta = false;
  
  // Actualizar contadores si aún hay plazas libres
  if (libres > 0) {
    libres--;
    ocupados++;
  }

  // Notificar inmediatamente a la web por Serial
  Serial.print("{\"event\":\"BARRIER_ENTRY_CLOSED\",\"status\":\"closed\",\"angle\":0,\"libres\":");
  Serial.print(libres);
  Serial.print(",\"ocupados\":");
  Serial.print(ocupados);
  Serial.println("}");
}

// Lectura de comandos enviados desde la página web (Totalmente NO BLOQUEANTE para no pausar el display)
void revisarComandosSerial() {
  while (Serial.available() > 0) {
    char c = (char)Serial.read();
    if (c == '\n' || c == '\r') {
      if (serialIndex > 0) {
        serialBuffer[serialIndex] = '\0';
        procesarComando(serialBuffer);
        serialIndex = 0;
      }
    } else if (serialIndex < sizeof(serialBuffer) - 1) {
      serialBuffer[serialIndex++] = c;
    }
  }
}

void procesarComando(const char* cmd) {
  if (strcmp(cmd, "OPEN_ENTRY") == 0 || strcmp(cmd, "OPEN") == 0) {
    if (!barreraAbierta) {
      abrirBarrera();
    }
  } else if (strcmp(cmd, "CLOSE_ENTRY") == 0 || strcmp(cmd, "CLOSE") == 0) {
    if (barreraAbierta) {
      cerrarBarrera();
    }
  } else if (strcmp(cmd, "TOGGLE") == 0) {
    if (!barreraAbierta) {
      abrirBarrera();
    } else {
      cerrarBarrera();
    }
  } else if (strcmp(cmd, "STATUS_REQ") == 0) {
    enviarTelemetriaSerial();
  } else if (strcmp(cmd, "RESET") == 0) {
    libres = 14;
    ocupados = 0;
    posicionDestino = 0;
    barreraAbierta = false;
    enviarTelemetriaSerial();
  }
}

// Envío periódico de estado en formato JSON a la página web
void enviarTelemetriaSerial() {
  Serial.print("{\"type\":\"TELEMETRY\",\"libres\":");
  Serial.print(libres);
  Serial.print(",\"ocupados\":");
  Serial.print(ocupados);
  Serial.print(",\"barrier\":\"");
  Serial.print(barreraAbierta ? "open" : "closed");
  Serial.print("\",\"angle\":");
  Serial.print(posicionActual);
  Serial.println("}");
}

void loop() {
  // 1. Refrescar la pantalla 7 Segmentos: SIEMPRE a máxima velocidad sin retrasos
  pantalla.refreshDisplay();
  
  // Formato: Ocupados a la izquierda y Libres a la derecha (Ej: "0014" o "0113")
  int numeroPantalla = (ocupados * 100) + libres;
  pantalla.setNumber(numeroPantalla);

  // 2. Escuchar comandos desde la página Web (Web Serial USB)
  revisarComandosSerial();

  // 3. Revisar el botón físico usando millis() con anti-rebote (50ms)
  if (millis() - ultimoTiempoBoton > 50) {
    int estadoBotonActual = digitalRead(pinBoton); 

    // Detectar flanco de bajada (cuando se pulsa el botón físico)
    if (estadoBotonActual == LOW && estadoBotonAnterior == HIGH) {
      if (barreraAbierta == false) {
        abrirBarrera();
      } else {
        cerrarBarrera();
      }
      ultimoTiempoBoton = millis();
    }
    estadoBotonAnterior = estadoBotonActual;
  }

  // 4. Mover el servomotor suavemente sin pausar el código
  if (posicionActual != posicionDestino) {
    if (millis() - tiempoAnteriorServo >= velocidadServo) {
      tiempoAnteriorServo = millis();
      
      if (posicionActual < posicionDestino) {
        posicionActual++; // Sube 1 grado
      } else {
        posicionActual--; // Baja 1 grado
      }
      barrera.write(posicionActual);
    }
  }

  // 5. Enviar telemetría periódica al Dashboard Web cada 1 segundo
  if (millis() - ultimoTiempoTelemetria >= INTERVALO_TELEMETRIA) {
    ultimoTiempoTelemetria = millis();
    enviarTelemetriaSerial();
  }
}
