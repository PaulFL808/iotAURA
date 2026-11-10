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
      rawLog: []
    };
    this.lineBuffer = '';
  }

  isSupported() {
    return 'serial' in navigator;
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
      throw new Error('Tu navegador no soporta Web Serial API. Usa Google Chrome o Microsoft Edge.');
    }

    try {
      // Solicitar al usuario que elija el puerto serie del Arduino (ej. COM3, COM4, /dev/ttyACM0)
      this.port = await navigator.serial.requestPort();
      await this.port.open({ baudRate });
      this.isConnected = true;
      this.emit('status', { connected: true, baudRate });
      this.emit('rawLog', { type: 'system', text: `Conectado a puerto serial a ${baudRate} baudios.` });

      // Iniciar el bucle de lectura continua
      this.startReading();
      return true;
    } catch (err) {
      this.isConnected = false;
      this.emit('status', { connected: false, error: err.message });
      throw err;
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

      // Intentar parsear JSON enviado por Arduino
      if (line.startsWith('{') && line.endsWith('}')) {
        try {
          const data = JSON.parse(line);
          if (data.type === 'TELEMETRY' && Array.isArray(data.slots)) {
            this.emit('telemetry', data.slots);
          } else if (data.event) {
            this.emit('barrierEvent', data.event);
          }
        } catch (e) {
          // No es JSON válido, ignorar o procesar como texto
        }
      }
    }
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

  // Comandos directos de barreras
  async openEntry() {
    return this.sendCommand('OPEN_ENTRY');
  }

  async closeEntry() {
    return this.sendCommand('CLOSE_ENTRY');
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
