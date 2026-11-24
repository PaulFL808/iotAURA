/*
  =============================================================================
  PROYECTO: SMART PARKING IoT (iotAURA) - ARDUINO UNO R3
  RAMO: Internet de las Cosas (IoT) & Arquitectura de Software
  PROFESOR: Osvaldo Archile
  INTEGRANTES:
    - Paul Ferrada
    - Fabián Mora
    - Felipe Labarca
    - Agustín Cañas

  HARDWARE Y CONEXIONES (BARRERA 1 CON FOTORRECEPTORES LDR):
    - Servomotor Barrera 1: Pin 10 (PWM)
    - Fotorreceptor LDR 1 (Aproximación/Entrada):
        * Señal analógica: Pin A0
        * Alimentación virtual Vcc: Pin Digital 4 (HIGH)
    - Fotorreceptor LDR 2 (Paso/Salida):
        * Señal analógica: Pin A1
        * Alimentación virtual Vcc: Pin Digital 5 (HIGH)
        * Tierra virtual GND: Pin Digital 6 (LOW)
    - Comunicación Serie USB: 9600 baudios (Web Serial API)
    - Funcionamiento:
        * Calibración automática de luz ambiental en setup() (5 muestras promedio).
        * Detección por sombra: si lectura > luzBase + 60, abre barrera automáticamente.
        * Cierre automático con retardo de 1.5s al quedar ambos sensores libres.
        * Control manual por Web Serial enviando carácter 'T' o 't'.
        * Notificaciones: "SISTEMA LISTO", "ESTADO: ABIERTA", "ESTADO: CERRADA".
  =============================================================================
*/

#include <Servo.h>

Servo barrera;

// Pines de los componentes
const int pinServo = 10;
const int ldr1Pin = A0;
const int ldr2Pin = A1;

// Pines virtuales de energía para los LDR
const int ldr1Vcc = 4;
const int ldr2Vcc = 5;
const int ldr2Gnd = 6;

bool barreraAbierta = false;
bool abiertaManual = false;
int velocidad = 20;

// Variables para calibración automática de luz
int luzBase1 = 0;
int luzBase2 = 0;
int margenCambio = 60; // Sensibilidad ajustada para luz de interior

void setup() {
  Serial.begin(9600);
  
  // Activamos energía virtual para los módulos LDR
  pinMode(ldr1Vcc, OUTPUT);
  digitalWrite(ldr1Vcc, HIGH);
  
  pinMode(ldr2Vcc, OUTPUT);
  digitalWrite(ldr2Vcc, HIGH);
  
  pinMode(ldr2Gnd, OUTPUT);
  digitalWrite(ldr2Gnd, LOW);

  barrera.attach(pinServo);
  barrera.write(0);

  // Calibración automática de luz ambiente (no tapes los sensores aquí)
  delay(500);
  long suma1 = 0;
  long suma2 = 0;
  for (int i = 0; i < 5; i++) {
    suma1 += analogRead(ldr1Pin);
    suma2 += analogRead(ldr2Pin);
    delay(50);
  }
  luzBase1 = suma1 / 5;
  luzBase2 = suma2 / 5;

  Serial.println("SISTEMA LISTO");
}

void loop() {
  int lectura1 = analogRead(ldr1Pin);
  int lectura2 = analogRead(ldr2Pin);

  bool sensor1Tapado = abs(lectura1 - luzBase1) > margenCambio;
  bool sensor2Tapado = abs(lectura2 - luzBase2) > margenCambio;
  bool autoDetectado = (sensor1Tapado || sensor2Tapado);

  // 1. Control manual desde el dashboard web
  if (Serial.available() > 0) {
    char comando = Serial.read();
    if (comando == 'T' || comando == 't') {
      if (!barreraAbierta) {
        abrirBarrera();
        abiertaManual = true;
      } else {
        cerrarBarrera();
        abiertaManual = false;
      }
    }
  }

  // 2. Control automático con los sensores LDR
  if (autoDetectado && !barreraAbierta) {
    abrirBarrera();
    abiertaManual = false;
  } 
  else if (!autoDetectado && barreraAbierta && !abiertaManual) {
    delay(1500);
    bool sigueLibre1 = abs(analogRead(ldr1Pin) - luzBase1) <= margenCambio;
    bool sigueLibre2 = abs(analogRead(ldr2Pin) - luzBase2) <= margenCambio;
    if (sigueLibre1 && sigueLibre2) {
      cerrarBarrera();
    }
  }

  delay(50);
}

void abrirBarrera() {
  for (int pos = 0; pos <= 90; pos += 1) {
    barrera.write(pos);
    delay(velocidad);
  }
  barreraAbierta = true;
  Serial.println("ESTADO: ABIERTA");
}

void cerrarBarrera() {
  for (int pos = 90; pos >= 0; pos -= 1) {
    barrera.write(pos);
    delay(velocidad);
  }
  barreraAbierta = false;
  Serial.println("ESTADO: CERRADA");
}
