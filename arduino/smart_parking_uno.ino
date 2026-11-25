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

  HARDWARE Y CONEXIONES:
    1. BARRERA DE ENTRADA:
       - Servomotor Entrada (SG90): Pin 10 (PWM)
       - Fotorreceptor LDR Entrada: Pin A0 (Apertura automática por sombra)
    2. BARRERA DE SALIDA:
       - Servomotor Salida (SG90): Pin 9 (PWM)
    3. PUESTO DE ESTACIONAMIENTO 1 (Plaza E-01):
       - Fotorreceptor LDR Puesto 1: Pin A1 (Monitoreo de ocupación vehicular)
    4. COMUNICACIÓN USB SERIE:
       - 9600 Baudios (Web Serial API)
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

// Pines de hardware
const int pinServoEntrada = 10;
const int pinServoSalida  = 9;
const int ldrEntradaPin   = A0;
const int ldrPuestoPin    = A1;

// Estados del sistema
bool entradaAbierta = false;
bool entradaManual  = false;
bool salidaAbierta  = false;
bool puestoOcupado  = false;

int velocidad = 20;

// Calibración automática de luz
int luzBaseEntrada = 0;
int luzBasePuesto  = 0;
int margenCambio   = 65; // Margen alto para evitar falsas alarmas

void setup() {
  Serial.begin(9600);

  servoEntrada.attach(pinServoEntrada);
  servoSalida.attach(pinServoSalida);

  servoEntrada.write(0);
  servoSalida.write(0);

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
    
    if (comando == 'S' || comando == 's') {
      if (!salidaAbierta) {
        moverBarrera(servoSalida, 0, 90);
        salidaAbierta = true;
        Serial.println("SALIDA: ABIERTA");
      } else {
        moverBarrera(servoSalida, 90, 0);
        salidaAbierta = false;
        Serial.println("SALIDA: CERRADA");
      }
    }
  }

  // 2. Automatización de barrera de ENTRADA (LDR 1 en A0)
  if (autoEnEntrada && !entradaAbierta) {
    delay(150); // Confirma que sea un auto real y no un parpadeo de luz
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

  // 3. Monitoreo de PUESTO 1 (LDR 2 en A1) con confirmación anti-rebote
  if (autoEnPuesto && !puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) > margenCambio) {
      puestoOcupado = true;
      Serial.println("PUESTO_1: OCUPADO");
    }
  } 
  else if (!autoEnPuesto && puestoOcupado) {
    delay(250);
    if (abs(leerSensorPromedio(ldrPuestoPin) - luzBasePuesto) <= margenCambio) {
      puestoOcupado = false;
      Serial.println("PUESTO_1: LIBRE");
    }
  }

  delay(50);
}

// Toma 8 lecturas rápidas y saca el promedio para filtrar picos eléctricos
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
  delay(300); // Pausa para estabilizar el voltaje tras mover el servo
}
