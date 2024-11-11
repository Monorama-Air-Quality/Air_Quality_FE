import React, { useState, useCallback, useRef, useMemo, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Alert, AlertDescription } from './ui/alert';
import { Bluetooth, Signal } from 'lucide-react';
import { connectBleDevice, parseSensorData } from '../lib/bluetooth';
import { SensorCard } from './SensorCard';
import { DataLog } from './DataLog';
import { wsManager, getCurrentLocation } from '../lib/websocket';
import { api } from '../lib/api';
import { DeviceInfoModal } from './DeviceInfoModal';
import '../styles/BleDeviceMonitor.css';
import { Loading } from './ui/loading';

export const getUnit = (key) => {
  const units = {
    pm25: ' μg/m³',
    pm10: ' μg/m³',
    temperature: '°C',
    humidity: '%',
    co2: ' ppm',
    voc: ' ppb'
  };
  return units[key] || '';
};

export const getLabel = (key) => {
  const labels = {
    pm25: 'PM2.5',
    pm10: 'PM10',
    temperature: 'Temperature',
    humidity: 'Humidity',
    co2: 'CO2',
    voc: 'VOC'
  };
  return labels[key] || key;
};

const BleDeviceMonitor = () => {
  const [device, setDevice] = useState(null);
  const [sensorData, setSensorData] = useState(null);
  const [dataLogs, setDataLogs] = useState([]);
  const [error, setError] = useState(null);
  const [location, setLocation] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const logIdRef = useRef(0);
  const [isConnecting, setIsConnecting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(false);

  useEffect(() => {
    if (device) {
      wsManager.connect().then(() => {
        wsManager.subscribe(`device/${device.id}`, handleWebSocketData);
      });

      return () => {
        wsManager.unsubscribe(`device/${device.id}`);
      };
    }
  }, [device]);

  useEffect(() => {
    const fetchLocation = async () => {
      try {
        setLocationError(null);
        const currentLocation = await getCurrentLocation();
        setLocation(currentLocation);
        console.log('Location fetched:', currentLocation);
      } catch (error) {
        setLocationError(error.message);
        console.error('Location error:', error);
      }
    };

    fetchLocation();
  }, []);

  const handleWebSocketData = useCallback((data) => {
    if (data.type === 'SENSOR_DATA') {
      setSensorData(data.payload);
    } else if (data.type === 'DEVICE_STATUS') {
      // 디바이스 상태 업데이트
    }
  }, []);

  const updateDataLogs = useCallback((data) => {
    const timestamp = new Date().toLocaleString();
    logIdRef.current += 1;
    const uniqueId = `log-${Date.now()}-${logIdRef.current}`;
    
    setDataLogs(prevLogs => {
      const newLogs = [{
        id: uniqueId,
        timestamp,
        data
      }, ...prevLogs];
      
      // 100개 이상일 때만 slice 수행
      if (newLogs.length > 100) {
        return newLogs.slice(0, 100);
      }
      return newLogs;
    });
  }, []);

  const handleSensorData = useCallback((event) => {
    try {
      setIsLoadingData(true);
      const data = parseSensorData(event.target.value);
      if (data) {
        setSensorData(data);
        
        wsManager.send('SENSOR_DATA', {
          deviceId: device?.id,
          timestamp: new Date().toISOString(),
          data
        });
        
        updateDataLogs(data);
      }
    } catch (error) {
      console.error('Error handling sensor data:', error);
      setError('Error processing sensor data');
    } finally {
      setIsLoadingData(false);
    }
  }, [updateDataLogs]);

  const handleConnect = async () => {
    try {
      setError(null);
      setIsConnecting(true);
      
      const result = await connectBleDevice(
        () => {
          setDevice(null);
          setSensorData(null);
          setError('Device disconnected');
        },
        handleSensorData
      );
      
      setDevice(result.device);
    } catch (error) {
      console.error('Connection error:', error);
      setError(error.message || 'Failed to connect to device');
      setDevice(null);
      setSensorData(null);
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = async () => {
    try {
      if (device?.gatt?.connected) {
        await device.gatt.disconnect();
      }
      setDevice(null);
      setSensorData(null);
      setError(null);
    } catch (error) {
      console.error('Disconnect error:', error);
      setError('Failed to disconnect device');
    }
  };

  const memoizedDataLog = useMemo(() => (
    <DataLog logs={dataLogs} />
  ), [dataLogs]);

  return (
    <div className="device-monitor-container bg-gray-50">
      <Card className="bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="flex items-center gap-2 text-gray-800">
            <Bluetooth className="h-6 w-6 text-blue-500" />
            Air Quality Monitor
          </CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50/50">
          <div className="device-header">
            {isConnecting ? (
              <div className="w-full flex justify-center">
                <Loading size="default" />
              </div>
            ) : !device ? (
              <Button onClick={handleConnect} className="connect-button">
                <Bluetooth className="h-5 w-5" />
                Connect to Device
              </Button>
            ) : (
              <>
                <div className="device-info">
                  <Signal className="h-4 w-4" />
                  <span>Connected to: {device.name}</span>
                  <Badge variant="outline">{device.id}</Badge>
                </div>
                <div className="device-controls">
                  <Button onClick={handleDisconnect} className="disconnect-button">
                    <Signal className="h-4 w-4" />
                    Disconnect
                  </Button>
                </div>
              </>
            )}
          </div>

          {location && (
            <div className="location-info bg-white/80 backdrop-blur-sm rounded-lg shadow-sm">
              <div className="font-semibold mb-1 text-gray-700">Location Info:</div>
              <div className="text-gray-600">Latitude: {location.latitude}</div>
              <div className="text-gray-600">Longitude: {location.longitude}</div>
            </div>
          )}

          <div className="realtime-data-section">
            <h3 className="text-lg font-semibold mb-3 text-gray-800 flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
              Realtime Data
            </h3>
            {!device ? (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-500">Connect to device first</div>
              </div>
            ) : !sensorData ? (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                <Loading />
              </div>
            ) : (
              <>
                <div className="sensor-grid">
                  {Object.entries(sensorData)
                    .filter(([key]) => key !== 'location' && key !== '_raw')
                    .map(([key, data]) => (
                      <SensorCard
                        key={key}
                        value={data.value}
                        level={data.level}
                        unit={getUnit(key)}
                        label={getLabel(key)}
                      />
                    ))}
                </div>
                
                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                  <div className="text-sm font-mono">
                    <div className="font-semibold mb-2">Raw Data (18 bytes):</div>
                    <div className="text-xs text-gray-600 mb-2">
                      PM2.5: [0-2] | PM10: [3-5] | TEMP: [6-8] | HUM: [9-11] | CO2: [12-14] | VOC: [15-17]
                    </div>
                    <div className="grid grid-cols-6 md:grid-cols-9 gap-2">
                      {sensorData._raw?.map((byte, index) => (
                        <div key={index} className="text-center">
                          <span className="bg-white px-2 py-1 rounded border">
                            {byte.toString(16).padStart(2, '0')}
                          </span>
                          <span className="text-gray-400 text-[10px] block">[{index}]</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {error && (
            <Alert variant="destructive" className="mt-4 bg-red-50 border-red-200">
              <AlertDescription className="text-red-700">{error}</AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4 bg-white/80 backdrop-blur-sm shadow-sm hover:shadow-md transition-shadow">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-800">Data Logs</CardTitle>
        </CardHeader>
        <CardContent className="bg-gray-50/50">
          <div className="data-log-container">
            {!device ? (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                <div className="text-gray-500">Connect to device first</div>
              </div>
            ) : dataLogs.length === 0 ? (
              <div className="min-h-[200px] flex items-center justify-center bg-gray-50 rounded-lg">
                <Loading />
              </div>
            ) : (
              memoizedDataLog
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default BleDeviceMonitor;