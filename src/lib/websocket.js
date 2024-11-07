class WebSocketManager {
  constructor() {
    this.ws = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.messageHandlers = new Map();
    this.wsUrl = process.env.REACT_APP_WS_URL;

    console.log('Current environment:', process.env.NODE_ENV);  // 'development' 또는 'production'
    console.log('WebSocket URL:', this.wsUrl);
  }

  connect() {
    return new Promise((resolve, reject) => {
      try {
        if (this.ws) {
          this.ws.close();
          this.ws = null;
        }

        console.log('Connecting to WebSocket:', this.wsUrl);
        this.ws = new WebSocket(this.wsUrl);

        this.ws.onopen = () => {
          console.log('WebSocket connected successfully');
          this.isConnected = true;
          this.reconnectAttempts = 0;
          resolve();
        };

        this.ws.onclose = (event) => {
          console.log('WebSocket disconnected:', event.code, event.reason);
          this.isConnected = false;
          if (event.code !== 1000) { // 정상적인 종료가 아닐 경우에만 재연결 시도
            this._handleReconnect();
          }
        };

        this.ws.onerror = (error) => {
          console.error('WebSocket error:', error);
          this.isConnected = false;
          reject(error);
        };

        this.ws.onmessage = (event) => {
          try {
            console.log('Received WebSocket message:', event.data);
            this._handleMessage(event.data);
          } catch (error) {
            console.error('Error handling message:', error);
          }
        };
      } catch (error) {
        console.error('WebSocket connection error:', error);
        reject(error);
      }
    });
  }

  sendDeviceStatus(deviceId, status) {
    if (this.isConnected) {
      const statusData = {
        deviceId,
        timestamp: new Date().toISOString(),
        connectionStatus: status.connected ? 'CONNECTED' : 'DISCONNECTED',
        firmwareVersion: status.firmwareVersion || 'unknown',
        batteryStatus: status.batteryStatus || 'UNKNOWN',
        batteryLevel: status.batteryLevel || 0,
        lastErrorMessage: status.lastError || null,
        lastConnectedAt: status.lastConnectedAt || new Date().toISOString(),
        lastDisconnectedAt: status.lastDisconnectedAt || null,
        ipAddress: status.ipAddress || null,
        rssi: status.rssi || 0
      };
      console.log('Sending device status:', statusData);
      this.ws.send(JSON.stringify(statusData));
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

  async send(type, payload) {
    if (this.isConnected) {
      try {
        // 위치 정보 가져오기
        let location = { latitude: null, longitude: null };
        try {
          console.log('Fetching location for message...');
          location = await getCurrentLocation();
          console.log('Location fetched for message:', location);
        } catch (locationError) {
          console.error('Failed to fetch location for message:', locationError);
        }

        // payload에 위치 정보 추가
        const messageWithLocation = {
          type,
          payload: {
            ...payload,
            latitude: location.latitude,
            longitude: location.longitude
          }
        };

        const message = JSON.stringify(messageWithLocation);
        console.log('Sending WebSocket message with location:', message);
        this.ws.send(message);
      } catch (error) {
        console.error('Error sending message:', error);
      }
    }
  }

  _handleMessage(data) {
    try {
      const message = JSON.parse(data);
      console.log('Parsed WebSocket message:', message);
      if (['hot', 'liveReload', 'hash', 'overlay', 'errors', 'warnings'].includes(message.type)) {
        return;
      }
      if (message.type === 'SENSOR_DATA') {
        const handler = this.messageHandlers.get(message.topic);
        if (handler) {
          handler(message.data);
        }
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
      try {
        await this.connect();
      } catch (error) {
        console.error('Reconnection failed:', error);
      }
    }
  }

  disconnect() {
    if (this.ws) {
      this.ws.close();
    }
  }
}

const getLocationFromIP = async () => {
  try {
    console.log('Starting location fetch from IP...');
    const apiKey = "5ff113b8507958";
    const url = `https://ipinfo.io/json?token=${apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5초 타임아웃

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'Accept': 'application/json'
      }
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    console.log('IP info received:', data);

    if (data.loc) {
      const [latitude, longitude] = data.loc.split(",").map(Number);
      console.log(`Location found - Lat: ${latitude}, Lng: ${longitude}`);
      return { latitude, longitude };
    }

    throw new Error('Location data not found in response');
  } catch (error) {
    console.error('Error fetching location:', error);
    return { latitude: null, longitude: null };
  }
};


const getCurrentLocation = async () => {
  try {
    console.log('Starting location fetch from browser...');

    // Promise를 async/await로 래핑
    const position = await new Promise((resolve, reject) => {
      const options = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0
      };

      navigator.geolocation.getCurrentPosition(resolve, reject, options);
    });

    const { latitude, longitude } = position.coords;
    console.log(`Location found - Lat: ${latitude}, Lng: ${longitude}`);
    return { latitude, longitude };

  } catch (error) {
    console.error('Error fetching location:', error);
    return { latitude: null, longitude: null };
  }
};

export { getCurrentLocation };

export const wsManager = new WebSocketManager();