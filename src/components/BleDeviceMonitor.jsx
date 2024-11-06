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
    }
  }, [device, updateDataLogs]);

  const handleConnect = async () => {
    try {
      setError(null);
      
      if (device) {
        setDevice(null);
        setSensorData(null);
        await new Promise(resolve => setTimeout(resolve, 2000));
      }
      
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
    <div className="w-full max-w-4xl mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bluetooth className="h-6 w-6" />
            Air Quality Monitor
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <h3 className="text-lg font-semibold mb-2">Location Info</h3>
            {locationError ? (
              <Alert variant="destructive">
                <AlertDescription>Location Error: {locationError}</AlertDescription>
              </Alert>
            ) : location ? (
              <div className="bg-gray-100 p-3 rounded-md">
                <p>Latitude: {location.latitude}</p>
                <p>Longitude: {location.longitude}</p>
              </div>
            ) : (
              <p className="text-gray-500">Fetching location...</p>
            )}
          </div>

          <div className="space-y-4">
            {!device ? (
              <Button onClick={handleConnect} className="w-full">
                Connect to Device
              </Button>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Signal className="h-4 w-4" />
                    <span>Connected to: {device.name}</span>
                    <Badge variant="outline">{device.id}</Badge>
                  </div>
                  <Button 
                    onClick={handleDisconnect}
                    variant="destructive"
                    size="sm"
                  >
                    Disconnect
                  </Button>
                </div>
                
                {sensorData && (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {Object.entries(sensorData)
                      .filter(([key]) => key !== 'location')
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
                )}
              </div>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </div>
        </CardContent>
      </Card>

      {device && (
        <Card>
          <CardHeader>
            <CardTitle>Data Logs</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-96 overflow-y-auto">
              {memoizedDataLog}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BleDeviceMonitor;