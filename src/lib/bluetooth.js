class BluetoothConnection {
  constructor() {
    this.device = null;
    this.server = null;
    this.characteristic = null;
    this.isConnecting = false;
    this.disconnectCallback = null;
    this.notificationCallback = null;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 3;
  }

  setCallbacks(disconnectCallback, notificationCallback) {
    this.disconnectCallback = disconnectCallback;
    this.notificationCallback = notificationCallback;
  }

  async connect() {
    if (this.isConnecting) {
      console.log('Connection already in progress...');
      return;
    }

    this.isConnecting = true;
    this.reconnectAttempts = 0;

    try {
      const result = await this._connect();
      this.isConnecting = false;
      return result;
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  async _connect() {
    try {
      // 이전 연결 정리
      if (this.device?.gatt?.connected) {
        await this.device.gatt.disconnect();
        await new Promise(resolve => setTimeout(resolve, 1000));
      }

      console.log('Requesting Bluetooth Device...');
      this.device = await navigator.bluetooth.requestDevice({
        filters: [{ name: 'Bandi-Pico' }],
        optionalServices: [
          '0000180a-0000-1000-8000-00805f9b34fb', // Device Information
          '0000ffe0-0000-1000-8000-00805f9b34fb', // Custom Service
          '0000ffb0-0000-1000-8000-00805f9b34fb', // Sensor Data Service
          '0000ffd0-0000-1000-8000-00805f9b34fb', // Gas Sensor Service
          '0000ffc0-0000-1000-8000-00805f9b34fb'  // Temperature/Humidity Service
        ]
      });

      console.log('Device selected:', this.device.name);
      
      // GATT 연결
      this.server = await this.device.gatt.connect();
      console.log('Connected to GATT Server');

      // 센서 활성화
      await this.enableSensors();
      
      // 센서 데이터 서비스 설정
      const service = await this.server.getPrimaryService('0000ffb0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service.getCharacteristic('0000ffb3-0000-1000-8000-00805f9b34fb');
      
      // 알림 시작
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.notificationCallback);

      // 연결 해제 이벤트 리스너
      this.device.addEventListener('gattserverdisconnected', () => {
        console.log('Device disconnected');
        if (this.disconnectCallback) {
          this.disconnectCallback();
        }
      });

      // 연결 성공 시 재시도 횟수 초기화
      this.reconnectAttempts = 0;
      
      // 연결 모니터링 추가
      this._startConnectionMonitoring();

      console.log('Connection successful!');

      return {
        device: this.device,
        characteristic: this.characteristic
      };

    } catch (error) {
      if (this.reconnectAttempts < this.maxReconnectAttempts) {
        this.reconnectAttempts++;
        console.log(`Reconnection attempt ${this.reconnectAttempts}...`);
        await new Promise(resolve => setTimeout(resolve, 1000));
        return this._connect();
      }
      throw error;
    }
  }

  _startConnectionMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }

    this.monitoringInterval = setInterval(() => {
      if (this.device?.gatt?.connected) {
        this.characteristic?.readValue()
          .catch(async (error) => {
            console.warn('Connection check failed:', error);
            if (!this.isConnecting) {
              try {
                // 재연결 시도
                await this._reconnect();
              } catch (reconnectError) {
                console.error('Reconnection failed:', reconnectError);
                await this.disconnect();
                if (this.disconnectCallback) {
                  this.disconnectCallback();
                }
              }
            }
          });
      }
    }, 10000); // 10초마다 체크 (5초에서 10초로 변경)
  }

  async _reconnect() {
    if (this.isConnecting) return;
    
    this.isConnecting = true;
    try {
      console.log('Attempting to reconnect...');
      
      // GATT 서버에 재연결
      this.server = await this.device.gatt.connect();
      
      // 센서 재활성화
      await this.enableSensors();
      
      // 센서 데이터 서비스 재설정
      const service = await this.server.getPrimaryService('0000ffb0-0000-1000-8000-00805f9b34fb');
      this.characteristic = await service.getCharacteristic('0000ffb3-0000-1000-8000-00805f9b34fb');
      
      // 알림 재시작
      await this.characteristic.startNotifications();
      this.characteristic.addEventListener('characteristicvaluechanged', this.notificationCallback);
      
      console.log('Reconnection successful');
      this.isConnecting = false;
    } catch (error) {
      this.isConnecting = false;
      throw error;
    }
  }

  async enableSensors() {
    try {
      // 미세먼지 센서 활성화
      const dustService = await this.server.getPrimaryService('0000ffe0-0000-1000-8000-00805f9b34fb');
      const dustChar = await dustService.getCharacteristic('0000ffe1-0000-1000-8000-00805f9b34fb');
      await dustChar.writeValue(new Uint8Array([0x01]));
      console.log('Dust sensor enabled');

      // 가스 센서 활성화
      const gasService = await this.server.getPrimaryService('0000ffd0-0000-1000-8000-00805f9b34fb');
      const gasChar = await gasService.getCharacteristic('0000ffd1-0000-1000-8000-00805f9b34fb');
      await gasChar.writeValue(new Uint8Array([0x01]));
      console.log('Gas sensor enabled');

      // 온습도 센서 활성화
      const thService = await this.server.getPrimaryService('0000ffc0-0000-1000-8000-00805f9b34fb');
      const thChar = await thService.getCharacteristic('0000ffc1-0000-1000-8000-00805f9b34fb');
      await thChar.writeValue(new Uint8Array([0x01]));
      console.log('Temperature/Humidity sensor enabled');

    } catch (error) {
      console.error('Error enabling sensors:', error);
    }
  }

  async disconnect() {
    try {
      if (this.monitoringInterval) {
        clearInterval(this.monitoringInterval);
      }
      
      if (this.characteristic) {
        await this.characteristic.stopNotifications();
        this.characteristic.removeEventListener('characteristicvaluechanged', this.notificationCallback);
      }
      
      if (this.device?.gatt?.connected) {
        await this.device.gatt.disconnect();
      }
    } catch (error) {
      console.error('Disconnect error:', error);
    } finally {
      this.server = null;
      this.characteristic = null;
      this.device = null;
    }
  }
}

export const bluetoothConnection = new BluetoothConnection();

export const connectBleDevice = async (onDisconnect, onNotification) => {
  bluetoothConnection.setCallbacks(onDisconnect, onNotification);
  return await bluetoothConnection.connect();
};

export const parseSensorData = (value) => {
  try {
    // DataView를 사용하여 데이터 접근
    const dataView = new DataView(value.buffer);
    const data = new Uint8Array(value.buffer);
    
    if (data.length < 18) {
      console.warn('Received incomplete data packet');
      return null;
    }

    // 데이터 파싱 결과를 임시 객체에 저장
    const parsedData = {
      pm25: {
        value: (data[0] << 8) + data[1],
        level: data[2]
      },
      pm10: {
        value: (data[3] << 8) + data[4],
        level: data[5]
      },
      temperature: {
        value: ((data[6] << 8) + data[7]) / 10.0,
        level: data[8]
      },
      humidity: {
        value: ((data[9] << 8) + data[10]) / 10.0,
        level: data[11]
      },
      co2: {
        value: (data[12] << 8) + data[13],
        level: data[14]
      },
      voc: {
        value: (data[15] << 8) + data[16],
        level: data[17]
      }
    };

    // 원본 데이터 배열을 직접 복사
    const rawDataArray = new Uint8Array(data.length);
    rawDataArray.set(data);
    
    return {
      ...parsedData,
      _raw: Array.from(rawDataArray) // 배열로 변환하여 저장
    };
  } catch (error) {
    console.error('Error parsing sensor data:', error);
    return null;
  }
};