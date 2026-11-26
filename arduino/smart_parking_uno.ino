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

  ARQUITECTURA DE HARDWARE Y FILTRADO AVANZADO (ESCALA 32x CON HISTÉRESIS):
    1. BARRERAS FÍSICAS (2x SERVOMOTORES SG90):
       - Servo Entrada: Pin 10 (PWM)
       - Servo Salida:  Pin 9 (PWM)
       - Rango seguro de movimiento: 15° (Cerrado) a 105° (Abierto)
         * Evita el tope mecánico en 0° protegiendo engranajes y voltaje USB.
    2. SENSORES FOTORRECEPTORES LDR CON FILTRO DE SOBREMUESTREO 32x:
       - LDR Entrada:  Pin A0 (Alimentado por Pin 3/4)
       - LDR Puesto 1: Pin A1 (Plaza E-01)
       - Filtro: 32 muestras consecutivas acumuladas para eliminar ruido eléctrico.
       - Histéresis de Puesto 1:
           * Ocupar:  Diferencia > 6 (rango auto: 9 a 18)
           * Liberar: Diferencia <= 4 (retorno rápido y estable en 200 ms)
       - Umbral Entrada: Diferencia > 14 (auto-apertura por sombra)
    3. RIELES DIGITALES DE ALIMENTACIÓN Y TIERRA VIRTUAL (CONEXIÓN DIRECTA):
       - Pin 3: Vcc (+5V virtual) para LDR 2 (Puesto LED)
       - Pin 4: Vcc (+5V virtual) para LDR 1 (Entrada)
       - Pin 5: GND (0V virtual) para LDR 2
       - Pin 6: GND (0V virtual) para Semáforo LED
    4. SEMÁFORO BICOLOR PUESTO 1 (PLAZA E-01):
       - Pin 8: LED Verde (Libre)
       - Pin 7: LED Rojo (Ocupado)
    5. COMUNICACIÓN SERIAL (9600 BAUDIOS):
       - Comando 'E' / 'e': Conmuta Barrera de Entrada (Pin 10)
       - Comando 'S' / 's': Conmuta Barrera de Salida (Pin 9)
       - Telemetría:
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
