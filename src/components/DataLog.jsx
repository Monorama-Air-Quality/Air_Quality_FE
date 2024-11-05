import React from 'react';
import { getUnit, getLabel } from './BleDeviceMonitor';

export const DataLog = React.memo(({ logs }) => {
  const formatValue = (key, value, unit) => {
    if (key === 'temperature' || key === 'humidity') {
      return Number(value).toFixed(1) + unit;
    }
    return value + unit;
  };

  return (
    <div className="space-y-4">
      {logs.map(({ timestamp, data, id }) => (
        <div key={id} className="border rounded p-4 bg-gray-50">
          <div className="text-sm font-semibold mb-2">{timestamp}</div>
          
          {/* Parsed Data */}
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mb-3">
            {Object.entries(data)
              .filter(([key]) => key !== 'location' && key !== '_raw')
              .map(([key, { value, level }]) => (
                <div key={key} className="text-sm">
                  <span className="font-medium">{getLabel(key)}: </span>
                  <span className={`${getLevelColor(level)} px-2 py-0.5 rounded`}>
                    {formatValue(key, value, getUnit(key))}
                    {' '}(Level: {level})
                  </span>
                </div>
            ))}
          </div>

          {/* Raw Data */}
          <div className="mt-2 pt-2 border-t border-gray-200">
            <div className="text-xs font-mono text-gray-600">
              <div className="font-semibold mb-1">Raw Data (18 bytes):</div>
              <div className="grid grid-cols-6 gap-x-4 gap-y-1">
                <div className="col-span-6 text-xs text-gray-500">
                  PM2.5: [0-2] | PM10: [3-5] | TEMP: [6-8] | HUM: [9-11] | CO2: [12-14] | VOC: [15-17]
                </div>
                {(data._raw || []).map((byte, i) => (
                  <div key={i} className="text-center">
                    {byte.toString(16).padStart(2, '0')}
                    <span className="text-gray-400 text-[10px] block">[{i}]</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
});

DataLog.displayName = 'DataLog';

const getLevelColor = (level) => {
  switch(level) {
    case 0: return 'text-blue-600';   // 좋음
    case 1: return 'text-green-600';  // 보통
    case 2: return 'text-orange-600'; // 나쁨
    case 3: return 'text-red-600';    // 매우 나쁨
    default: return 'text-gray-600';
  }
};