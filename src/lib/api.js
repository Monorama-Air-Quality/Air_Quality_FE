const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const api = {
  async fetchDeviceHistory(deviceId, startDate, endDate) {
    const response = await fetch(
      `${API_BASE_URL}/devices/${deviceId}/history?start=${startDate}&end=${endDate}`
    );
    return response.json();
  },

  async saveDeviceData(deviceId, data) {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/data`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  async getDeviceStatus(deviceId) {
    const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/status`);
    return response.json();
  }
}; 