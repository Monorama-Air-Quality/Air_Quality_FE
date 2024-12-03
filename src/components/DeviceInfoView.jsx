import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { Button } from "./ui/button";
import { api } from "../lib/api";

const DeviceInfoView = () => {
  const [searchParams] = useSearchParams();
  const [deviceInfo, setDeviceInfo] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editForm, setEditForm] = useState({
    floorLevel: "",
    placeType: "",
    description: "",
  });

  const deviceId = searchParams.get("deviceId");

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      if (!deviceId) return;

      try {
        setIsLoading(true);
        setError(null);
        const data = await api.getDeviceInfo(deviceId);
        setDeviceInfo(data);
        setEditForm({
          floorLevel: data.location?.floorLevel?.toString() || "",
          placeType: data.location?.placeType || "",
          description: data.location?.description || "",
        });
      } catch (error) {
        console.error("Error fetching device info:", error);
        setError("Failed to load device information");
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeviceInfo();
  }, [deviceId]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleCancel = () => {
    setIsEditing(false);
    setEditForm({
      floorLevel: deviceInfo.location?.floorLevel?.toString() || "",
      placeType: deviceInfo.location?.placeType || "",
      description: deviceInfo.location?.description || "",
    });
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setEditForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const locationData = {
        floorLevel: parseInt(editForm.floorLevel, 10),
        placeType: editForm.placeType,
        description: editForm.description,
      };

      await api.updateDeviceLocation(deviceId, locationData);
      const updatedDevice = await api.getDeviceInfo(deviceId);
      setDeviceInfo(updatedDevice);
      setIsEditing(false);
    } catch (error) {
      console.error("Failed to update device location:", error);
      setError("Failed to update device location");
    }
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto p-4 flex justify-center items-center min-h-[200px]">
        <div className="text-gray-500">Loading device information...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  if (!deviceInfo) {
    return (
      <div className="max-w-4xl mx-auto p-4">
        <div className="text-gray-500">No device information available</div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4">
      <Card className="bg-white/80 backdrop-blur-sm shadow-lg">
        <CardHeader className="border-b border-gray-100 bg-gray-50">
          <CardTitle className="flex items-center justify-between">
            <span className="text-gray-800 text-xl">Device Information</span>
            {!isEditing && (
              <Button
                onClick={handleEdit}
                className="bg-blue-500 hover:bg-blue-600 transition-colors"
              >
                <span className="text-white">Edit Location</span>
              </Button>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <div className="bg-gray-50 p-4 rounded-lg mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-2">
              Device ID
            </h3>
            <p className="font-mono text-gray-900 bg-gray-100 px-3 py-1 rounded inline-block">
              {deviceId}
            </p>
          </div>

          {isEditing ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Floor Level
                </label>
                <input
                  type="number"
                  name="floorLevel"
                  value={editForm.floorLevel}
                  onChange={handleChange}
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location Type
                </label>
                <input
                  type="text"
                  name="placeType"
                  value={editForm.placeType}
                  onChange={handleChange}
                  placeholder="e.g., Office, Meeting Room, etc."
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  value={editForm.description}
                  onChange={handleChange}
                  placeholder="Additional details about the location"
                  rows="4"
                  className="w-full p-2 border rounded focus:ring-2 focus:ring-blue-500 bg-white"
                />
              </div>
              <div className="flex justify-end gap-2 pt-4">
                <Button
                  type="button"
                  onClick={handleCancel}
                  className="bg-gray-500 hover:bg-gray-600 transition-colors"
                >
                  <span className="text-white">Cancel</span>
                </Button>
                <Button
                  type="submit"
                  className="bg-blue-500 hover:bg-blue-600 transition-colors"
                >
                  <span className="text-white">Save</span>
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Floor Level
                </h3>
                <p className="text-lg text-gray-900">
                  {deviceInfo.location?.floorLevel || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Location Type
                </h3>
                <p className="text-gray-900">
                  {deviceInfo.location?.placeType || "-"}
                </p>
              </div>
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-sm font-medium text-gray-700 mb-2">
                  Description
                </h3>
                <p className="text-gray-900">
                  {deviceInfo.location?.description || "-"}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default DeviceInfoView;
