// Servicio de Comunicación con Arduino UNO vía Web Serial API (USB)
// Para AURA Smart Parking - Maqueta IoT
// Hardware: 2x Servomotores (Pines 10 y 9) + 2x Fotorreceptores LDR (Pines A0 y A1)
// Integrantes: Paul Ferrada, Fabián Mora, Felipe Labarca, Agustín Cañas

class ArduinoSerialService {
  constructor() {
    this.port = null;
    this.reader = null;
    this.writer = null;
    this.readableStreamClosed = null;
    this.writableStreamClosed = null;
    this.isConnected = false;
    this.listeners = {
      status: [],
      telemetry: [],
      barrierEvent: [],
      barrierStatus: [],
      slotStatus: [],
      systemReady: [],
      rawLog: []
    };
    this.lineBuffer = '';
    this.initUsbListeners();
  }

  isSupported() {
    return 'serial' in navigator;
  }

  initUsbListeners() {
    if (this.isSupported()) {
      navigator.serial.addEventListener('connect', () => {
        this.emit('rawLog', { type: 'system', text: 'Dispositivo USB serie detectado en el equipo.' });
      });
      navigator.serial.addEventListener('disconnect', (e) => {
        if (this.port && e.target === this.port) {
          this.emit('rawLog', { type: 'warning', text: 'Dispositivo Arduino desconectado físicamente del puerto USB.' });
          this.disconnect();
        }
      });
    }
  }

  on(event, callback) {
    if (!this.listeners[event]) {
      this.listeners[event] = [];
    }
    this.listeners[event].push(callback);
    return () => {
      this.listeners[event] = this.listeners[event].filter(cb => cb !== callback);
    };
  }

  emit(event, data) {
    if (this.listeners[event]) {
      this.listeners[event].forEach(cb => {
        try {
          cb(data);
        } catch (e) {
          console.error(`[ArduinoSerial] Error en listener de ${event}:`, e);
        }
      });
    }
  }

  async connect(baudRate = 9600) {
    if (!this.isSupported()) {
      const err = new Error('Tu navegador no soporta Web Serial API. Por favor usa Google Chrome o Microsoft Edge en PC.');
      this.emit('status', { connected: false, error: err.message });
      throw err;
    }

    try {
      // Solicita al usuario elegir el puerto serie (COM) usando navigator.serial.requestPort()
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.isConnected = true;
      this.emit('status', { connected: true, baudRate });
      this.emit('rawLog', { 
        type: 'system', 
        text: `Conexión establecida a ${baudRate} baudios. Listo para controlar Entrada ('E') y Salida ('S').` 
      });

      // Iniciar el bucle de lectura continua mediante ReadableStream
      this.startReading();
      return true;
    } catch (err) {
      this.isConnected = false;
      let friendlyMessage = err.message;
      if (err.name === 'NotFoundError') {
        friendlyMessage = 'Selección de puerto COM cancelada por el usuario.';
      } else if (err.name === 'SecurityError') {
        friendlyMessage = 'Permiso denegado para acceder al puerto USB serie.';
      } else if (err.name === 'InvalidStateError') {
        friendlyMessage = 'El puerto serie ya está en uso por otra ventana o aplicación.';
      }
      this.emit('status', { connected: false, error: friendlyMessage });
      this.emit('rawLog', { type: 'error', text: friendlyMessage });
      throw new Error(friendlyMessage);
    }
  }

  async startReading() {
    while (this.port && this.port.readable && this.isConnected) {
      try {
        const textDecoder = new TextDecoderStream();
        this.readableStreamClosed = this.port.readable.pipeTo(textDecoder.writable);
        this.reader = textDecoder.readable.getReader();

        while (true) {
          const { value, done } = await this.reader.read();
          if (done) {
            break;
          }
          if (value) {
            this.handleIncomingChunk(value);
          }
        }
      } catch (err) {
        if (this.isConnected) {
          this.emit('rawLog', { type: 'error', text: `Error en lectura serial: ${err.message}` });
        }
        break;
      }
    }
  }

  handleIncomingChunk(chunk) {
    this.lineBuffer += chunk;
    const lines = this.lineBuffer.split('\n');
    this.lineBuffer = lines.pop(); // Guardar el fragmento incompleto

    for (const rawLine of lines) {
      const line = rawLine.trim();
      if (!line) continue;

      this.emit('rawLog', { type: 'rx', text: line, time: new Date().toLocaleTimeString('es-CL') });

      // 1. Mensaje de arranque y calibración
      if (line.includes('SISTEMA LISTO')) {
        this.emit('rawLog', { 
          type: 'success', 
          text: '✅ Arduino: Calibración óptica LDR (Entrada A0 y Puesto 1 A1) completada.', 
          time: new Date().toLocaleTimeString('es-CL') 
        });
        this.emit('systemReady', { message: 'SISTEMA LISTO' });
      }

      // 2. Telemetría de Barrera de ENTRADA (Servo Pin 10)
      else if (line.includes('ENTRADA: ABIERTA') || line.includes('ESTADO: ABIERTA') || line.includes('ENTRY_OPENED')) {
        this.emit('barrierStatus', { status: 'open', gate: 'entry', rawText: line });
        this.emit('barrierEvent', 'BARRIER_ENTRY_OPEN', { status: 'open', rawText: line });
      } else if (line.includes('ENTRADA: CERRADA') || line.includes('ESTADO: CERRADA') || line.includes('ENTRY_CLOSED')) {
        this.emit('barrierStatus', { status: 'closed', gate: 'entry', rawText: line });
        this.emit('barrierEvent', 'BARRIER_ENTRY_CLOSED', { status: 'closed', rawText: line });
      }

      // 3. Telemetría de Barrera de SALIDA (Servo Pin 9)
      else if (line.includes('SALIDA: ABIERTA') || line.includes('EXIT_OPENED')) {
        this.emit('barrierStatus', { status: 'open', gate: 'exit', rawText: line });
        this.emit('barrierEvent', 'BARRIER_EXIT_OPEN', { status: 'open', rawText: line });
      } else if (line.includes('SALIDA: CERRADA') || line.includes('EXIT_CLOSED')) {
        this.emit('barrierStatus', { status: 'closed', gate: 'exit', rawText: line });
        this.emit('barrierEvent', 'BARRIER_EXIT_CLOSED', { status: 'closed', rawText: line });
      }

      // 4. Telemetría de Puesto 1 (Plaza E-01 con sensor LDR Pin A1)
      else if (line.includes('PUESTO_1: OCUPADO') || line.includes('PUESTO 1: OCUPADO')) {
        this.emit('slotStatus', { slotId: 1, code: 'E-01', status: 'occupied', distanceCm: 4.5, rawText: line });
        this.emit('rawLog', { 
          type: 'info', 
          text: '🚗 Puesto 1 (E-01) OCUPADO: Fotorreceptor LDR en Pin A1 detectó sombra vehicular.', 
          time: new Date().toLocaleTimeString('es-CL') 
        });
      } else if (line.includes('PUESTO_1: LIBRE') || line.includes('PUESTO 1: LIBRE')) {
        this.emit('slotStatus', { slotId: 1, code: 'E-01', status: 'available', distanceCm: 48.0, rawText: line });
        this.emit('rawLog', { 
          type: 'info', 
          text: '🟢 Puesto 1 (E-01) LIBRE: Sensor LDR en Pin A1 despejado.', 
          time: new Date().toLocaleTimeString('es-CL') 
        });
      }

      // 5. Intentar parsear JSON enviado por Arduino si existiera
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'TELEMETRY') {
            this.emit('telemetry', data);
          } else if (data.event) {
            this.emit('barrierEvent', data.event, data);
          }
        } catch (e) {
          // No es JSON
        }
      }
    }
  }

  /**
   * Escribe un carácter en el puerto serie hacia el Arduino
   */
  async writeChar(char = 'E') {
    if (!this.port || !this.port.writable) {
      this.emit('rawLog', { type: 'warning', text: `No hay conexión serie activa para enviar '${char}'` });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(encoder.encode(char));
      writer.releaseLock();

      const desc = char === 'E' || char === 'e' 
        ? "Toggle Barrera ENTRADA (Pin 10)" 
        : (char === 'S' || char === 's' ? "Toggle Barrera SALIDA (Pin 9)" : "Comando");

      this.emit('rawLog', { 
        type: 'tx', 
        text: `Carácter '${char}' enviado al Arduino UNO (${desc})`, 
        time: new Date().toLocaleTimeString('es-CL') 
      });
      return true;
    } catch (err) {
      this.emit('rawLog', { type: 'error', text: `Error al enviar carácter '${char}': ${err.message}` });
      return false;
    }
  }

  // Alterna Barrera de Entrada enviando 'E'
  async toggleEntry() {
    return this.writeChar('E');
  }

  // Alterna Barrera de Salida enviando 'S'
  async toggleExit() {
    return this.writeChar('S');
  }

  // Alterna barrera según compuerta
  async toggleBarrier(gate = 'entry') {
    if (gate === 'exit') {
      return this.toggleExit();
    }
    return this.toggleEntry();
  }

  // Métodos directos
  async openEntry() {
    return this.writeChar('E');
  }

  async closeEntry() {
    return this.writeChar('E');
  }

  async openExit() {
    return this.writeChar('S');
  }

  async closeExit() {
    return this.writeChar('S');
  }

  async disconnect() {
    this.isConnected = false;
    try {
      if (this.reader) {
        await this.reader.cancel();
        this.reader = null;
      }
      if (this.readableStreamClosed) {
        await this.readableStreamClosed.catch(() => {});
      }
      if (this.port) {
        await this.port.close();
        this.port = null;
      }
      this.emit('status', { connected: false });
      this.emit('rawLog', { type: 'system', text: 'Desconectado del puerto serial.' });
    } catch (err) {
      console.warn('[ArduinoSerial] Error al desconectar:', err);
    }
  }
}

export const arduinoSerial = new ArduinoSerialService();
