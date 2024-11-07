const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;



export const api = {
  async fetchDeviceHistory(deviceId, startDate, endDate) {
    try {
      console.log('Fetching device history...', { deviceId, startDate, endDate });
      const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/history?start=${startDate}&end=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log('History data received:', data);
      return data;
    } catch (error) {
      console.error('Error fetching device history:', error);
      throw error;
    }
  },



  async saveDeviceData(deviceId, data) {
    try {
      console.log('Saving device data...', { deviceId, data });
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/data`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log('Save response:', result);
      return result;
    } catch (error) {
      console.error('Error saving device data:', error);
      throw error;
    }
  },



  async getDeviceStatus(deviceId) {
    try {
      console.log('Getting device status...', { deviceId });
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/status`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const status = await response.json();
      console.log('Device status received:', status);
      return status;
    } catch (error) {
      console.error('Error getting device status:', error);
      throw error;
    }
  }
}; 
