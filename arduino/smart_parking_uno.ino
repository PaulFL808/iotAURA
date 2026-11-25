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

  HARDWARE Y CONEXIONES (CONFIGURACIÓN OPTIMIZADA DE POTENCIA USB):
    1. BARRERA DE ENTRADA (FÍSICA):
       - Servomotor Entrada (SG90): Pin 10 (PWM)
       - Fotorreceptor LDR Entrada: Pin A0 (Apertura automática por sombra vehicular)
    2. PUESTO DE ESTACIONAMIENTO 1 (Plaza E-01 FÍSICA):
       - Fotorreceptor LDR Puesto 1: Pin A1 (Detección de presencia física de vehículo)
       - LED Indicador Verde (Libre): Pin Digital 7
       - LED Indicador Rojo (Ocupado): Pin Digital 8
    3. NOTA DE DISEÑO ELÉCTRICO / ARQUITECTURA:
       - Se utiliza 1 servomotor SG90 en entrada para respetar el límite de 500mA
         del estándar USB 2.0 del PC, evitando caídas de voltaje (brownout resets).
       - La barrera de salida se opera como gemelo virtual/software en la nube.
    4. COMUNICACIÓN USB SERIE:
       - 9600 Baudios (Web Serial API)
       - Comando 'E' / 'e': Conmuta Barrera de Entrada (Pin 10)
       - Telemetría:
           * "SISTEMA LISTO"
           * "ENTRADA: ABIERTA" / "ENTRADA: CERRADA"
           * "PUESTO_1: OCUPADO" (Enciende LED Rojo Pin 8, apaga LED Verde Pin 7)
           * "PUESTO_1: LIBRE"   (Enciende LED Verde Pin 7, apaga LED Rojo Pin 8)
  =============================================================================
*/

#include <Servo.h>

Servo servoEntrada;

// Pines de hardware
const int pinServoEntrada = 10;
const int ldrEntradaPin   = A0;
const int ldrPuestoPin    = A1;
const int pinLedVerde     = 7;
const int pinLedRojo      = 8;

// Estados del sistema
bool entradaAbierta = false;
bool entradaManual  = false;
bool puestoOcupado  = false;

int velocidad = 20;

// Calibración automática de luz
int luzBaseEntrada = 0;
int luzBasePuesto  = 0;
int margenCambio   = 65;

void setup() {
  Serial.begin(9600);

  pinMode(pinLedVerde, OUTPUT);
  pinMode(pinLedRojo, OUTPUT);

  // Inicia marcando puesto libre (verde encendido, rojo apagado)
  digitalWrite(pinLedVerde, HIGH);
  digitalWrite(pinLedRojo, LOW);

  servoEntrada.attach(pinServoEntrada);
  servoEntrada.write(0);

  // Calibración inicial (no tapar los sensores durante 1 segundo)
  delay(800);
  luzBaseEntrada = leerSensorPromedio(ldrEntradaPin);
  luzBasePuesto  = leerSensorPromedio(ldrPuestoPin);

  Serial.println("SISTEMA LISTO");
}

void loop() {
  int lecturaEntrada = leerSensorPromedio(ldrEntradaPin);
  int lecturaPuesto  = leerSensorPromedio(ldrPuestoPin);

  bool autoEnEntrada = abs(lecturaEntrada - luzBaseEntrada) > margenCambio;
  bool autoEnPuesto  = abs(lecturaPuesto  - luzBasePuesto)  > margenCambio;

  // 1. Comandos desde página web o Monitor Serie
  if (Serial.available() > 0) {
    char comando = Serial.read();
    
    if (comando == 'E' || comando == 'e') {
      if (!entradaAbierta) {
        moverBarrera(servoEntrada, 0, 90);
        entradaAbierta = true;
        entradaManual = true;
        Serial.println("ENTRADA: ABIERTA");
      } else {
        moverBarrera(servoEntrada, 90, 0);
        entradaAbierta = false;
        entradaManual = false;
        Serial.println("ENTRADA: CERRADA");
      }
    }
  }

  // 2. Automatización de barrera de ENTRADA (LDR 1 en A0)
  if (autoEnEntrada && !entradaAbierta) {
    delay(150);
    if (abs(leerSensorPromedio(ldrEntradaPin) - luzBaseEntrada) > margenCambio) {
      moverBarrera(servoEntrada, 0, 90);
      entradaAbierta = true;
      entradaManual = false;
      Serial.println("ENTRADA: ABIERTA");
    }
  } 
  else if (!autoEnEntrada && entradaAbierta && !entradaManual) {
    delay(1500);
    if (abs(leerSensorPromedio(ldrEntradaPin) - luzBaseEntrada) <= margenCambio) {
      moverBarrera(servoEntrada, 90, 0);
      entradaAbierta = false;
      Serial.println("ENTRADA: CERRADA");
    }
  }

  // 3. Monitoreo de PUESTO 1 (LDR 2 en A1) y control del LED bicolor
  if (autoEnPuesto && !puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) > margenCambio) {
      puestoOcupado = true;
      digitalWrite(pinLedVerde, LOW);
      digitalWrite(pinLedRojo, HIGH);
      Serial.println("PUESTO_1: OCUPADO");
    }
  } 
  else if (!autoEnPuesto && puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) <= margenCambio) {
      puestoOcupado = false;
      digitalWrite(pinLedVerde, HIGH);
      digitalWrite(pinLedRojo, LOW);
      Serial.println("PUESTO_1: LIBRE");
    }
  }

  delay(50);
}

int leerSensorPromedio(int pin) {
  long suma = 0;
  for (int i = 0; i < 8; i++) {
    suma += analogRead(pin);
    delay(2);
  }
  return suma / 8;
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
  delay(300);
}
