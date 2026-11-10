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
    - Servomotor Barrera 1: Pin 10 (PWM)
    - Botón Pulsador de Acceso: Pin 2 (INPUT_PULLUP a GND)
    - Conexión al Computador: Cable USB Serial (9600 baudios)
    - Protocolo Web Serial:
        * Enviar carácter 'T' o 't' desde la web para alternar (toggle) la barrera.
        * El Arduino responde con "ESTADO: ABIERTA" o "ESTADO: CERRADA".
  =============================================================================
*/

#include <Servo.h>

Servo barrera;       
int pinBoton = 2; // Asegúrate de que el botón esté en el pin 2 o 3, según lo hayas dejado    

bool barreraAbierta = false;       
int estadoBotonAnterior = HIGH;    
int velocidad = 20; 

void setup() {
  Serial.begin(9600); // Abre la comunicación con la página web
  barrera.attach(10); // Motor en el pin 10
  barrera.write(0);   
  pinMode(pinBoton, INPUT_PULLUP); 
}

void loop() {
  bool activarBarrera = false;

  // 1. Revisar si se apretó el botón físico
  int estadoBotonActual = digitalRead(pinBoton); 
  if (estadoBotonActual == LOW && estadoBotonAnterior == HIGH) {
    activarBarrera = true;
  }
  estadoBotonAnterior = estadoBotonActual;

  // 2. Revisar si llegó un comando desde la página web
  if (Serial.available() > 0) {
    char comando = Serial.read();
    // Si la web envía la letra 'T' (Toggle), activa la barrera
    if (comando == 'T' || comando == 't') {
      activarBarrera = true;
    }
  }

  // 3. Mover la barrera si fue activada (por botón o por web)
  if (activarBarrera) {
    if (barreraAbierta == false) {
      for (int pos = 0; pos <= 90; pos += 1) { 
        barrera.write(pos);
        delay(velocidad); 
      }
      barreraAbierta = true; 
      Serial.println("ESTADO: ABIERTA"); // Le avisa a la web que se abrió
    } 
    else {
      for (int pos = 90; pos >= 0; pos -= 1) { 
        barrera.write(pos);
        delay(velocidad); 
      }
      barreraAbierta = false; 
      Serial.println("ESTADO: CERRADA"); // Le avisa a la web que se cerró
    }
  }
  
  delay(50); 
}
