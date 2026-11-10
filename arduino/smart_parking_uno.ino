/*
  =============================================================================
  PROYECTO: SMART PARKING IoT (iotAURA) - ARDUINO UNO R3
  ASIGNATURA: Ramo IoT
  INTEGRANTES:
    - Paul Ferrada
    - Fabián Mora
    - Felipe Labarca
    - Agustín Cañas

  HARDWARE Y CONEXIONES (BARRERA 1):
    - Servomotor Barrera 1: Pin 9 (PWM)
    - Botón Pulsador de Acceso: Pin 2 (INPUT_PULLUP a GND)
    - Conexión al Computador: Cable USB Serial (9600 baudios)
  =============================================================================
*/

#include <Servo.h>

Servo barrera;       
const int pinBoton = 2;    

// Variables de estado
bool barreraAbierta = false;       
int estadoBotonAnterior = HIGH;    

// Ajusta este número para cambiar la velocidad del motor (mayor = más lento)
int velocidad = 20; 

// Control de telemetría no bloqueante hacia la página web
unsigned long ultimoEnvioTelemetria = 0;

void abrirBarrera() {
  if (!barreraAbierta) {
    // Abre lentamente de 0 a 90 grados
    for (int pos = 0; pos <= 90; pos += 1) { 
      barrera.write(pos);
      delay(velocidad); 
    }
    barreraAbierta = true; 
    
    // Notificar inmediatamente a la web por el cable USB
    Serial.println("{\"event\":\"BARRIER_ENTRY_OPEN\",\"barrier\":1,\"status\":\"open\",\"angle\":90}");
  }
}

void cerrarBarrera() {
  if (barreraAbierta) {
    // Cierra lentamente de 90 a 0 grados
    for (int pos = 90; pos >= 0; pos -= 1) { 
      barrera.write(pos);
      delay(velocidad); 
    }
    barreraAbierta = false; 
    
    // Notificar inmediatamente a la web por el cable USB
    Serial.println("{\"event\":\"BARRIER_ENTRY_CLOSED\",\"barrier\":1,\"status\":\"closed\",\"angle\":0}");
  }
}

void enviarTelemetria() {
  Serial.print("{\"type\":\"TELEMETRY\",\"barrier\":1,\"status\":\"");
  Serial.print(barreraAbierta ? "open" : "closed");
  Serial.print("\",\"angle\":");
  Serial.print(barreraAbierta ? 90 : 0);
  Serial.println("}");
}

void setup() {
  // Iniciar comunicación Serial a 9600 baudios con la página web
  Serial.begin(9600);

  barrera.attach(9); 
  barrera.write(0);  // La barrera empieza cerrada a 0 grados
  pinMode(pinBoton, INPUT_PULLUP); // Activa la resistencia interna para el botón

  // Mensaje de inicio a la web
  Serial.println("{\"type\":\"SYSTEM\",\"status\":\"READY\",\"barrier\":1,\"pin\":9,\"project\":\"iotAURA\"}");
}

void loop() {
  // 1. Escuchar órdenes enviadas desde los botones de la página Web
  if (Serial.available() > 0) {
    String cmd = Serial.readStringUntil('\n');
    cmd.trim();

    if (cmd == "OPEN_ENTRY" || cmd == "OPEN" || cmd == "OPEN_BARRIER_1") {
      abrirBarrera();
    } else if (cmd == "CLOSE_ENTRY" || cmd == "CLOSE" || cmd == "CLOSE_BARRIER_1") {
      cerrarBarrera();
    } else if (cmd == "TOGGLE" || cmd == "TOGGLE_ENTRY") {
      if (!barreraAbierta) {
        abrirBarrera();
      } else {
        cerrarBarrera();
      }
    } else if (cmd == "STATUS_REQ") {
      enviarTelemetria();
    }
  }

  // 2. Revisar el botón físico en Pin 2
  int estadoBotonActual = digitalRead(pinBoton); 

  // Detecta el momento exacto en que se aprieta el botón físico
  if (estadoBotonActual == LOW && estadoBotonAnterior == HIGH) {
    if (barreraAbierta == false) {
      abrirBarrera();
    } else {
      cerrarBarrera();
    }
  }
  estadoBotonAnterior = estadoBotonActual;

  // 3. Enviar estado periódico a la web cada 1 segundo
  if (millis() - ultimoEnvioTelemetria >= 1000) {
    ultimoEnvioTelemetria = millis();
    enviarTelemetria();
  }

  delay(30); 
}
