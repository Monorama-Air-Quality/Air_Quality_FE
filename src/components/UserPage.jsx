import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/card';
import { Link } from 'react-router-dom';
import { Button } from './ui/button';

const UserPage = () => {
  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-gray-100">
          <CardTitle className="text-gray-800">User Dashboard</CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <h2 className="text-lg font-semibold mb-4">Manage Your Data</h2>
          <div className="space-y-4">
            <Link to="/user/history">
              <Button className="bg-blue-500 hover:bg-blue-600 text-white">
                View Sensor Data History
              </Button>
            </Link>
            {/* 다른 관리 기능 버튼 추가 가능 */}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default UserPage; 