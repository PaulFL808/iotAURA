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

  HARDWARE Y CONEXIONES (CONEXIÓN DIRECTA CON RIELES VIRTUALES Y ÁNGULOS SEGUROS):
    1. BARRERAS FÍSICAS (2x SERVOMOTORES SG90):
       - Servo Entrada: Pin 10 (PWM)
       - Servo Salida:  Pin 9 (PWM)
       - Rango seguro de movimiento: 15° (Cerrado) a 105° (Abierto)
         * Evita el tope mecánico en 0° eliminando zumbidos y sobrecalentamiento.
    2. SENSORES FOTORRECEPTORES LDR:
       - LDR Entrada: Pin A0 (Margen cambio: 65)
       - LDR Puesto 1 (Plaza E-01): Pin A1 (Margen cambio: 45)
    3. PINES DIGITALES COMO RIELES DE ENERGÍA Y TIERRA VIRTUAL:
       - Pin 4: Vcc (+5V virtual) para LDR 1
       - Pin 5: GND (0V virtual) para LDR 2
       - Pin 6: GND (0V virtual) para LEDs
    4. SEMÁFORO BICOLOR PUESTO 1 (PLAZA E-01):
       - Pin 8: LED Verde (Encendido cuando plaza está libre)
       - Pin 7: LED Rojo (Encendido cuando vehículo estaciona sobre LDR A1)
    5. COMUNICACIÓN USB SERIE (9600 BAUDIOS):
       - Comando 'E' / 'e': Conmuta Barrera de Entrada (Pin 10)
       - Comando 'S' / 's': Conmuta Barrera de Salida (Pin 9)
       - Telemetría de estado:
           * "SISTEMA LISTO"
           * "ENTRADA: ABIERTA" / "ENTRADA: CERRADA"
           * "SALIDA: ABIERTA"  / "SALIDA: CERRADA"
           * "PUESTO_1: OCUPADO" / "PUESTO_1: LIBRE"
  =============================================================================
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
const int pinLdr1Vcc      = 4;
const int pinLdr2Gnd      = 5;
const int pinLedGnd       = 6;
const int pinLedVerde     = 8;
const int pinLedRojo      = 7;

// Estados del sistema
bool entradaAbierta = false;
bool entradaManual  = false;
bool salidaAbierta  = false;
bool puestoOcupado  = false;

int velocidad = 20;

// Ángulos seguros (evitan tope mecánico en 0°)
const int anguloCerrado = 15;
const int anguloAbierto = 105;

// Calibración automática de luz
int luzBaseEntrada = 0;
int luzBasePuesto  = 0;
int margenEntrada  = 65;
int margenPuesto   = 45;

void setup() {
  Serial.begin(9600);

  pinMode(pinLdr1Vcc, OUTPUT);
  digitalWrite(pinLdr1Vcc, HIGH);

  pinMode(pinLdr2Gnd, OUTPUT);
  digitalWrite(pinLdr2Gnd, LOW);

  pinMode(pinLedGnd, OUTPUT);
  digitalWrite(pinLedGnd, LOW);

  pinMode(pinLedVerde, OUTPUT);
  pinMode(pinLedRojo, OUTPUT);

  // Inicia en verde (puesto libre)
  digitalWrite(pinLedVerde, HIGH);
  digitalWrite(pinLedRojo, LOW);

  servoEntrada.attach(pinServoEntrada);
  servoSalida.attach(pinServoSalida);

  servoEntrada.write(anguloCerrado);
  delay(300);
  servoSalida.write(anguloCerrado);

  delay(800);
  luzBaseEntrada = leerSensorPromedio(ldrEntradaPin);
  luzBasePuesto  = leerSensorPromedio(ldrPuestoPin);

  Serial.println("SISTEMA LISTO");
}

void loop() {
  int lecturaEntrada = leerSensorPromedio(ldrEntradaPin);
  int lecturaPuesto  = leerSensorPromedio(ldrPuestoPin);

  bool autoEnEntrada = abs(lecturaEntrada - luzBaseEntrada) > margenEntrada;
  bool autoEnPuesto  = abs(lecturaPuesto  - luzBasePuesto)  > margenPuesto;

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
    delay(150);
    if (abs(leerSensorPromedio(ldrEntradaPin) - luzBaseEntrada) > margenEntrada) {
      moverBarrera(servoEntrada, anguloCerrado, anguloAbierto);
      entradaAbierta = true;
      entradaManual = false;
      Serial.println("ENTRADA: ABIERTA");
    }
  } 
  else if (!autoEnEntrada && entradaAbierta && !entradaManual) {
    delay(1500);
    if (abs(leerSensorPromedio(ldrEntradaPin) - luzBaseEntrada) <= margenEntrada) {
      moverBarrera(servoEntrada, anguloAbierto, anguloCerrado);
      entradaAbierta = false;
      Serial.println("ENTRADA: CERRADA");
    }
  }

  // 3. Monitoreo de PUESTO 1 (LDR 2 en A1) y control del LED bicolor
  if (autoEnPuesto && !puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) > margenPuesto) {
      puestoOcupado = true;
      digitalWrite(pinLedVerde, LOW);
      digitalWrite(pinLedRojo, HIGH);
      Serial.println("PUESTO_1: OCUPADO");
    }
  } 
  else if (!autoEnPuesto && puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) <= margenPuesto) {
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
