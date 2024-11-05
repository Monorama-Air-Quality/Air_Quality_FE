const formatSensorData = (data, deviceId) => {
    return {
      deviceId,
      timestamp: new Date().toISOString(),
      pm25Value: data.pm25.value,
      pm25Level: data.pm25.level,
      pm10Value: data.pm10.value,
      pm10Level: data.pm10.level,
      temperature: data.temperature.value,
      temperatureLevel: data.temperature.level,
      humidity: data.humidity.value,
      humidityLevel: data.humidity.level,
      co2Value: data.co2.value,
      co2Level: data.co2.level,
      vocValue: data.voc.value,
      vocLevel: data.voc.level,
      rawData: Array.from(new Uint8Array(data.rawData))
    };
  };
  
  class WebSocketManager {
    constructor() {
      this.ws = null;
      this.isConnected = false;
      this.reconnectAttempts = 0;
      this.maxReconnectAttempts = 5;
      this.messageHandlers = new Map();
    }
  
    connect(url = process.env.REACT_APP_WS_URL) {
      return new Promise((resolve, reject) => {
        try {
          this.ws = new WebSocket(url);
          
          this.ws.onopen = () => {
            console.log('WebSocket connected');
            this.isConnected = true;
            this.reconnectAttempts = 0;
            resolve();
          };
  
          this.ws.onclose = () => {
            console.log('WebSocket disconnected');
            this.isConnected = false;
            this._handleReconnect();
          };
  
          this.ws.onerror = (error) => {
            console.error('WebSocket error:', error);
            reject(error);
          };
  
          this.ws.onmessage = (event) => {
            this._handleMessage(event.data);
          };
        } catch (error) {
          reject(error);
        }
      });
    }
  
    sendSensorData(sensorData, deviceId) {
      if (this.isConnected) {
        const formattedData = formatSensorData(sensorData, deviceId);
        this.ws.send(JSON.stringify(formattedData));
      }
    }

    subscribe(topic, callback) {
        this.messageHandlers.set(topic, callback);
        if (this.isConnected) {
        this.send('SUBSCRIBE', { topic });
        }
    }

  unsubscribe(topic) {
    this.messageHandlers.delete(topic);
    if (this.isConnected) {
      this.send('UNSUBSCRIBE', { topic });
    }
  }

  send(type, payload) {
    if (this.isConnected) {
      this.ws.send(JSON.stringify({ type, payload }));
    }
  }

  _handleMessage(data) {
    try {
      const message = JSON.parse(data);
      const handler = this.messageHandlers.get(message.topic);
      if (handler) {
        handler(message.data);
      }
    } catch (error) {
      console.error('Error handling message:', error);
    }
  }

  async _handleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      this.reconnectAttempts++;
      console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      this.connect();
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

export const wsManager = new WebSocketManager(); 