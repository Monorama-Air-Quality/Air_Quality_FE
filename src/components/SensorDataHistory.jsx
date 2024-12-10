import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { api } from '../lib/api';

const SensorDataHistory = () => {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [apiKey, setApiKey] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(20);
  const [data, setData] = useState([]);
  const [error, setError] = useState(null);

  const handleSearch = async (e) => {
    e.preventDefault();
    setError(null);

    const searchRequest = {
      location: {
        latitude: parseFloat(location.latitude),
        longitude: parseFloat(location.longitude),
      },
      dateRange: {
        start: new Date(dateRange.start),
        end: new Date(dateRange.end),
      },
      apiKey,
    };

    const isLocationValid = location.latitude && location.longitude;
    const isDateRangeValid = dateRange.start && dateRange.end;
    const isSearchAllowed = (isLocationValid && !isDateRangeValid) || (!isLocationValid && isDateRangeValid) || (isLocationValid && isDateRangeValid);

    if (!isSearchAllowed) {
      setError('Please provide either a valid location or a valid date range.');
      return;
    }

    console.log(JSON.stringify(searchRequest));

    try {
      const result = await api.searchSensorData(searchRequest, page, size);
      setData(result);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Failed to fetch sensor data.');
    }
  };

  const handleReset = () => {
    setLocation({ latitude: '', longitude: '' });
    setDateRange({ start: '', end: '' });
    setApiKey('');
    setPage(0);
    setSize(20);
    setData([]);
    setError(null);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-800">Sensor Data History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Location (Latitude)</label>
              <input
                type="text"
                value={location.latitude}
                onChange={(e) => setLocation({ ...location, latitude: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Location (Longitude)</label>
              <input
                type="text"
                value={location.longitude}
                onChange={(e) => setLocation({ ...location, longitude: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range (Start)</label>
              <input
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Date Range (End)</label>
              <input
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">API Key</label>
              <input
                type="text"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Page Number</label>
              <input
                type="number"
                value={page}
                onChange={(e) => setPage(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Size</label>
              <input
                type="number"
                value={size}
                onChange={(e) => setSize(Number(e.target.value))}
                className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500"
                min="1"
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white">
                Search
              </Button>
              <Button type="button" onClick={handleReset} className="bg-gray-500 hover:bg-gray-600 text-white">
                Reset
              </Button>
            </div>
            {error && <div className="text-red-500">{error}</div>}
          </form>

          {data.length > 0 && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Results:</h3>
              <ul>
                {data.map((item, index) => (
                  <li key={index} className="border-b py-2">
                    <div>Device ID: {item.deviceId}</div>
                    <div>Timestamp: {item.timestamp}</div>
                    <div>PM2.5: {item.pm25Value} (Level: {item.pm25Level})</div>
                    <div>Temperature: {item.temperature} (Level: {item.temperatureLevel})</div>
                    <div>PM10: {item.pm10Value} (Level: {item.pm10Level})</div>
                    <div>Humidity: {item.humidity} (Level: {item.humidityLevel})</div>
                    <div>CO2: {item.co2Value} (Level: {item.co2Level})</div>
                    <div>VOC: {item.vocValue} (Level: {item.vocLevel})</div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorDataHistory; 