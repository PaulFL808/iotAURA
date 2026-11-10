// Servicio de Comunicación con Arduino UNO vía Web Serial API (USB)
// Para AURA Smart Parking - Maqueta IoT
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
      navigator.serial.addEventListener('connect', (e) => {
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
    if (this.listeners[event]) {
      this.listeners[event].push(callback);
    }
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
      this.emit('rawLog', { type: 'system', text: `Conexión establecida a ${baudRate} baudios. Listo para enviar 'T' y recibir estados.` });

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

      // Escuchar específicamente los textos del sketch Arduino:
      // "ESTADO: ABIERTA" o "ESTADO: CERRADA"
      if (line.includes('ESTADO: ABIERTA') || line.includes('ENTRY_OPENED') || line === 'ABIERTA') {
        this.emit('barrierStatus', { status: 'open', gate: 'entry', rawText: line });
        this.emit('barrierEvent', 'BARRIER_ENTRY_OPEN', { status: 'open', rawText: line });
      } else if (line.includes('ESTADO: CERRADA') || line.includes('ENTRY_CLOSED') || line === 'CERRADA') {
        this.emit('barrierStatus', { status: 'closed', gate: 'entry', rawText: line });
        this.emit('barrierEvent', 'BARRIER_ENTRY_CLOSED', { status: 'closed', rawText: line });
      }

      // Intentar parsear JSON enviado por Arduino si existiera
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'TELEMETRY') {
            this.emit('telemetry', data);
          } else if (data.event) {
            this.emit('barrierEvent', data.event, data);
          }
        } catch (e) {
          // No es JSON válido
        }
      }
    }
  }

  /**
   * Escribe el carácter 'T' en el puerto serie hacia el Arduino para alternar la barrera
   */
  async writeChar(char = 'T') {
    if (!this.port || !this.port.writable) {
      this.emit('rawLog', { type: 'warning', text: `No hay conexión serie activa para enviar '${char}'` });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      await writer.write(encoder.encode(char));
      writer.releaseLock();

      this.emit('rawLog', { 
        type: 'tx', 
        text: `Carácter '${char}' enviado al Arduino UNO (Toggle Barrera)`, 
        time: new Date().toLocaleTimeString('es-CL') 
      });
      return true;
    } catch (err) {
      this.emit('rawLog', { type: 'error', text: `Error al enviar carácter '${char}': ${err.message}` });
      return false;
    }
  }

  // Alterna la barrera enviando 'T'
  async toggleBarrier() {
    return this.writeChar('T');
  }

  async sendCommand(command) {
    if (!this.port || !this.port.writable) {
      this.emit('rawLog', { type: 'warning', text: `No hay Arduino conectado para enviar: ${command}` });
      return false;
    }

    try {
      const encoder = new TextEncoder();
      const writer = this.port.writable.getWriter();
      const data = encoder.encode(command.trim() + '\n');
      await writer.write(data);
      writer.releaseLock();

      this.emit('rawLog', { type: 'tx', text: command.trim(), time: new Date().toLocaleTimeString('es-CL') });
      return true;
    } catch (err) {
      this.emit('rawLog', { type: 'error', text: `Error al enviar comando: ${err.message}` });
      return false;
    }
  }

  // Comandos de compatibilidad
  async openEntry() {
    return this.writeChar('T');
  }

  async closeEntry() {
    return this.writeChar('T');
  }

  async openExit() {
    return this.sendCommand('OPEN_EXIT');
  }

  async closeExit() {
    return this.sendCommand('CLOSE_EXIT');
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
