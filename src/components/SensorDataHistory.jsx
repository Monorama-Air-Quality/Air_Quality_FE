import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Button } from './ui/button';
import { api } from '../lib/api';

const SensorDataHistory = () => {
  const [location, setLocation] = useState({ latitude: '', longitude: '' });
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [apiKey, setApiKey] = useState('');
  const [page, setPage] = useState(0);
  const [size, setSize] = useState(10);
  const [data, setData] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
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

    try {
      const result = await api.searchSensorData(searchRequest, page, size);
      console.log('API Result:', JSON.stringify(result));
      setData(result.content[1]);
      setTotalPages(result.totalPages);
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
    setSize(10);
    setData([]);
    setTotalPages(0);
    setError(null);
  };

  const handlePageChange = async (newPage) => {
    if (newPage < 0) {
      newPage = 0; // 0페이지로 제한
    } else if (newPage >= totalPages) {
      newPage = totalPages - 1; // 최종 페이지로 제한
    }
    setPage(newPage);
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

    try {
      const result = await api.searchSensorData(searchRequest, newPage, size);
      setData(result.content[1]);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error('Error fetching sensor data:', error);
      setError('Failed to fetch sensor data.');
    }
  };

  const handleNextGroup = () => {
    const nextPage = Math.floor(page / 10) * 10 + 10; // 다음 10페이지로 이동
    handlePageChange(nextPage);
  };

  const handlePrevGroup = () => {
    const prevPage = Math.floor(page / 10) * 10 - 10; // 이전 10페이지로 이동
    handlePageChange(prevPage);
  };

  const getPaginationButtons = () => {
    const buttons = [];
    const startPage = Math.floor(page / 10) * 10;
    const endPage = Math.min(startPage + 10, totalPages);

    for (let i = startPage; i < endPage; i++) {
      buttons.push(
        <Button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`mx-1 ${page === i ? 'bg-blue-500 text-white' : 'bg-gray-300'}`}
        >
          {i + 1}
        </Button>
      );
    }
    return buttons;
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-800">Sensor Data History</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
            </div>
            <div className="grid grid-cols-2 gap-4">
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
              <div className="grid grid-cols-1 gap-4">
                {data.map((item, index) => (
                  <Card key={index} className="bg-gray-100 p-4 rounded-lg shadow-md">
                    <div>Device ID: {item.deviceId}</div>
                    <div>Timestamp: {item.timestamp}</div>
                    <div>PM2.5: {item.pm25Value} (Level: {item.pm25Level})</div>
                    <div>PM10: {item.pm10Value} (Level: {item.pm10Level})</div>
                    <div>Temperature: {item.temperature} (Level: {item.temperatureLevel})</div>
                    <div>Humidity: {item.humidity} (Level: {item.humidityLevel})</div>
                    <div>CO2: {item.co2Value} (Level: {item.co2Level})</div>
                    <div>VOC: {item.vocValue} (Level: {item.vocLevel})</div>
                    <div>Latitude: {item.latitude}</div>
                    <div>Longitude: {item.longitude}</div>
                  </Card>
                ))}
              </div>
              <div className="flex justify-center mt-4">
                <Button onClick={() => handlePageChange(Math.max(0, Math.floor(page / 10) * 10 - 10))} disabled={page === 0}>
                  &lt;&lt;
                </Button>
                <Button onClick={() => handlePageChange(Math.max(0, Math.floor(page / 10) * 10 - 1))} disabled={page === 0}>
                  &lt;
                </Button>
                {getPaginationButtons()}
                <Button onClick={() => handlePageChange(Math.min(totalPages - 1, Math.floor(page / 10) * 10 + 10))} disabled={page >= totalPages - 1}>
                  &gt;
                </Button>
                <Button onClick={() => handlePageChange(totalPages - 1)} disabled={page >= totalPages - 1}>
                  &gt;&gt;
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SensorDataHistory; 