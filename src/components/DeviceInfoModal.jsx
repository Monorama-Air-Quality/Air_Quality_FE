import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export const DeviceInfoModal = ({ isOpen, onClose, deviceId, onSubmit }) => {
  const [formData, setFormData] = useState({
    placeType: '',
    floorLevel: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({
      deviceId,
      ...formData
    });
    onClose();
    console.log("DeviceInfoModal submitted", deviceId, formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50">
      <div className="absolute inset-0 bg-black/30 backdrop-blur-sm" onClick={onClose} />
      
      <Card className="w-full max-w-md relative z-50 bg-white/95 backdrop-blur-md shadow-xl">
        <CardHeader>
          <CardTitle>Enter Device Information</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Place Type</label>
              <input
                type="text"
                name="placeType"
                value={formData.placeType}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Floor Level</label>
              <input
                type="number"
                name="floorLevel"
                value={formData.floorLevel}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                className="w-full p-2 border rounded bg-white/80 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                rows="3"
                required
              />
            </div>
            <div className="flex justify-end space-x-2 pt-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                className="hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-blue-500 hover:bg-blue-600 text-white"
              >
                Save
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}; 