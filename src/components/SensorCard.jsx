import React from 'react';
import { Card, CardContent } from './ui/card';

export const SensorCard = React.memo(({ value, level, unit, label }) => {
  const getStatusColor = (level) => {
    switch(level) {
      case 0: return 'bg-blue-500';
      case 1: return 'bg-green-500';
      case 2: return 'bg-orange-500';
      case 3: return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="pt-6">
        <div className={`rounded-full w-3 h-3 mb-2 ${getStatusColor(level)}`} />
        <div className="text-2xl font-bold">
          {value !== undefined ? `${value}${unit}` : 'N/A'}
        </div>
        <div className="text-sm text-gray-500">{label}</div>
      </CardContent>
    </Card>
  );
});

SensorCard.displayName = 'SensorCard';