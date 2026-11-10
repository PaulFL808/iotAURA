/*
  =============================================================================
  PROYECTO: SMART PARKING IoT (iotAURA) - ARDUINO UNO R3
  ASIGNATURA: Taller / Ramo de IoT
  INTEGRANTES:
    - Paul Ferrada
    - Fabián Mora
    - Felipe Labarca
    - Agustín Cañas

  DESCRIPCIÓN:
    Controlador para maqueta física de 6 estacionamientos:
    - 6 Sensores Ultrasónicos HC-SR04 (Espacios 1 a 6)
    - 2 Sensores Ultrasónicos (Entrada y Salida)
    - 2 Servomotores SG90 (Barrera Entrada pin 9, Salida pin 10)
    - Pantalla LCD 16x2 I2C (Dirección 0x27)
    - Comunicación Serial bidireccional (JSON) compatible con Web Serial API
      y Firebase Firestore en la aplicación Web iotAURA
  =============================================================================
*/

#include <Wire.h>
#include <LiquidCrystal_I2C.h>
#include <Servo.h>

// Configuración LCD I2C 16x2
LiquidCrystal_I2C lcd(0x27, 16, 2);

// Servomotores para barreras de acceso
Servo servoEntrada;
Servo servoSalida;
const int PIN_SERVO_ENTRADA = 9;
const int PIN_SERVO_SALIDA  = 10;

// Pines Sensores Ultrasónicos HC-SR04 (Trig compartido para optimizar pines en Arduino UNO)
const int PIN_TRIG_GLOBAL = 2; // Disparo común para todos los sensores de plazas
const int PIN_ECHO_SLOT[6] = {3, 4, 5, 6, 7, 8}; // Pines Echo para Plazas 1 a 6

// Sensor Entrada y Salida (Pines analógicos usados como digitales en Arduino UNO)
const int PIN_TRIG_ACCESO = A0;
const int PIN_ECHO_ENTRADA = A1;
const int PIN_ECHO_SALIDA  = A2;

// Umbral de ocupación según maqueta (en centímetros)
const float UMBRAL_OCUPADO_CM = 10.0;

// Estado actual de los 6 espacios
bool slotOcupado[6] = {false, false, false, false, false, false};
float slotDistancia[6] = {50.0, 50.0, 50.0, 50.0, 50.0, 50.0};

// Estado de barreras
bool barreraEntradaAbierta = false;
bool barreraSalidaAbierta = false;
unsigned long tiempoAutoCierreEntrada = 0;
unsigned long tiempoAutoCierreSalida = 0;
const unsigned long TIEMPO_PASO_MS = 3500; // 3.5 segundos para auto-cierre tras detección por sensor

// Variables de tiempo para muestreo no bloqueante
unsigned long ultimaLectura = 0;
const unsigned long INTERVALO_LECTURA = 1000; // Cada 1 segundo

// Función para medir distancia con HC-SR04 (en cm)
float medirDistancia(int pinTrig, int pinEcho) {
  digitalWrite(pinTrig, LOW);
  delayMicroseconds(2);
  digitalWrite(pinTrig, HIGH);
  delayMicroseconds(10);
  digitalWrite(pinTrig, LOW);

  long duracion = pulseIn(pinEcho, HIGH, 25000); // Timeout 25ms (~4 metros)
  if (duracion == 0) return 99.9; // Sin eco o fuera de rango
  return (duracion * 0.0343) / 2.0;
}

void abrirBarreraEntradaManual() {
  servoEntrada.write(90); // 90 grados: barrera levantada
  barreraEntradaAbierta = true;
  tiempoAutoCierreEntrada = 0; // Modo manual: permanece abierta hasta orden web
  Serial.println("{\"event\":\"BARRIER_ENTRY_OPEN\",\"status\":\"open\",\"angle\":90}");
}

void cerrarBarreraEntradaManual() {
  servoEntrada.write(0);  // 0 grados: barrera abajo
  barreraEntradaAbierta = false;
  tiempoAutoCierreEntrada = 0;
  Serial.println("{\"event\":\"BARRIER_ENTRY_CLOSED\",\"status\":\"closed\",\"angle\":0}");
}

void abrirBarreraSalidaManual() {
  servoSalida.write(90);
  barreraSalidaAbierta = true;
  tiempoAutoCierreSalida = 0;
  Serial.println("{\"event\":\"BARRIER_EXIT_OPEN\",\"status\":\"open\",\"angle\":90}");
}

void cerrarBarreraSalidaManual() {
  servoSalida.write(0);
  barreraSalidaAbierta = false;
  tiempoAutoCierreSalida = 0;
  Serial.println("{\"event\":\"BARRIER_EXIT_CLOSED\",\"status\":\"closed\",\"angle\":0}");
}

void setup() {
  // Inicialización Puerto Serial a 9600 baudios para Web Serial API y Gateway
  Serial.begin(9600);

  // Configuración de pines de sensores
  pinMode(PIN_TRIG_GLOBAL, OUTPUT);
  pinMode(PIN_TRIG_ACCESO, OUTPUT);
  for (int i = 0; i < 6; i++) {
    pinMode(PIN_ECHO_SLOT[i], INPUT);
  }
  pinMode(PIN_ECHO_ENTRADA, INPUT);
  pinMode(PIN_ECHO_SALIDA, INPUT);

  // Configuración e inicio de Servomotores en posición cerrada (0 grados)
  servoEntrada.attach(PIN_SERVO_ENTRADA);
  servoSalida.attach(PIN_SERVO_SALIDA);
  servoEntrada.write(0);
  servoSalida.write(0);

  // Inicialización de Pantalla LCD I2C
  lcd.init();
  lcd.backlight();
  lcd.setCursor(0, 0);
  lcd.print("iotAURA PARKING");
  lcd.setCursor(0, 1);
  lcd.print("INICIANDO IOT...");
  delay(1200);
  lcd.clear();

  Serial.println("{\"type\":\"SYSTEM\",\"status\":\"READY\",\"team\":\"Paul, Fabian, Felipe, Agustin\"}");
}

void loop() {
  // 1. Escuchar comandos desde la aplicación Web (vía Web Serial o API)
  if (Serial.available() > 0) {
    String comando = Serial.readStringUntil('\n');
    comando.trim();

    if (comando == "OPEN_ENTRY") {
      abrirBarreraEntradaManual();
    } else if (comando == "CLOSE_ENTRY") {
      cerrarBarreraEntradaManual();
    } else if (comando == "OPEN_EXIT") {
      abrirBarreraSalidaManual();
    } else if (comando == "CLOSE_EXIT") {
      cerrarBarreraSalidaManual();
    } else if (comando == "STATUS_REQ") {
      enviarTelemetriaSerialJSON();
    }
  }

  // 2. Comprobar auto-cierre temporizado si se abrió por sensor
  unsigned long ahora = millis();
  if (tiempoAutoCierreEntrada > 0 && ahora >= tiempoAutoCierreEntrada) {
    cerrarBarreraEntradaManual();
  }
  if (tiempoAutoCierreSalida > 0 && ahora >= tiempoAutoCierreSalida) {
    cerrarBarreraSalidaManual();
  }

  // 3. Muestreo periódico de los sensores de los 6 espacios
  if (ahora - ultimaLectura >= INTERVALO_LECTURA) {
    ultimaLectura = ahora;
    actualizarSensoresEstacionamiento();
    verificarSensoresAcceso();
    actualizarPantallaLCD();
    enviarTelemetriaSerialJSON();
  }
}

// Lectura de los 6 espacios de estacionamiento
void actualizarSensoresEstacionamiento() {
  for (int i = 0; i < 6; i++) {
    slotDistancia[i] = medirDistancia(PIN_TRIG_GLOBAL, PIN_ECHO_SLOT[i]);
    slotOcupado[i] = (slotDistancia[i] < UMBRAL_OCUPADO_CM);
    delay(15); // Pausa breve entre mediciones para disipar ecos ultrasónicos
  }
}

// Lectura de entrada y salida mediante sensores de barrera
void verificarSensoresAcceso() {
  float distEntrada = medirDistancia(PIN_TRIG_ACCESO, PIN_ECHO_ENTRADA);
  if (distEntrada < UMBRAL_OCUPADO_CM) {
    int libres = contarEspaciosLibres();
    if (libres > 0 && !barreraEntradaAbierta) {
      servoEntrada.write(90);
      barreraEntradaAbierta = true;
      tiempoAutoCierreEntrada = millis() + TIEMPO_PASO_MS;
      Serial.println("{\"event\":\"BARRIER_ENTRY_AUTO_OPEN\",\"trigger\":\"sensor\"}");
    }
  }

  float distSalida = medirDistancia(PIN_TRIG_ACCESO, PIN_ECHO_SALIDA);
  if (distSalida < UMBRAL_OCUPADO_CM) {
    if (!barreraSalidaAbierta) {
      servoSalida.write(90);
      barreraSalidaAbierta = true;
      tiempoAutoCierreSalida = millis() + TIEMPO_PASO_MS;
      Serial.println("{\"event\":\"BARRIER_EXIT_AUTO_OPEN\",\"trigger\":\"sensor\"}");
    }
  }
}

int contarEspaciosLibres() {
  int libres = 0;
  for (int i = 0; i < 6; i++) {
    if (!slotOcupado[i]) libres++;
  }
  return libres;
}

// Mostrar en LCD 16x2
void actualizarPantallaLCD() {
  int libres = contarEspaciosLibres();
  lcd.setCursor(0, 0);
  lcd.print("LIBRES: ");
  lcd.print(libres);
  lcd.print("/6   ");

  lcd.setCursor(0, 1);
  if (libres == 0) {
    lcd.print("ESTADO: LLENO  ");
  } else {
    lcd.print("DISPONIBLE     ");
  }
}

// Envío de paquete JSON por Serial compatible con el Dashboard Web
void enviarTelemetriaSerialJSON() {
  Serial.print("{\"type\":\"TELEMETRY\",\"slots\":[");
  for (int i = 0; i < 6; i++) {
    Serial.print("{\"id\":");
    Serial.print(i + 1);
    Serial.print(",\"dist\":");
    Serial.print(slotDistancia[i], 1);
    Serial.print(",\"occ\":");
    Serial.print(slotOcupado[i] ? "true" : "false");
    Serial.print("}");
    if (i < 5) Serial.print(",");
  }
  Serial.println("]}");
}
