import React from 'react';
import { Line } from 'react-chartjs-2';

export const DataVisualization = ({ data, timeRange }) => {
  // 차트 데이터 구성
  const chartData = {
    labels: data.map(d => d.timestamp),
    datasets: [
      {
        label: 'Temperature',
        data: data.map(d => d.temperature.value),
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1
      },
      // 다른 센서 데이터도 추가
    ]
  };

  return (
    <div className="w-full h-64">
      <Line data={chartData} options={{
        responsive: true,
        maintainAspectRatio: false,
        // 차트 옵션 설정
      }} />
    </div>
  );
}; 