const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

export const api = {
  async fetchDeviceHistory(deviceId, startDate, endDate) {
    try {
      console.log("Fetching device history...", {
        deviceId,
        startDate,
        endDate,
      });
      const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/history?start=${startDate}&end=${endDate}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      console.log("History data received:", data);
      return data;
    } catch (error) {
      console.error("Error fetching device history:", error);
      throw error;
    }
  },

  async saveDeviceData(deviceId, data) {
    try {
      console.log("Saving device data...", { deviceId, data });
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}/data`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Save response:", result);
      return result;
    } catch (error) {
      console.error("Error saving device data:", error);
      throw error;
    }
  },

  async getDeviceStatus(deviceId) {
    try {
      console.log("Getting device status...", { deviceId });
      const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/status`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const status = await response.json();
      console.log("Device status received:", status);
      return status;
    } catch (error) {
      console.error("Error getting device status:", error);
      throw error;
    }
  },

  async saveDeviceInfo(deviceInfo) {
    try {
      const response = await fetch(`${API_BASE_URL}/device`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(deviceInfo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error saving device info:", error);
      throw error;
    }
  },

  async getProjectList() {
    try {
      const response = await fetch(`${API_BASE_URL}/projects`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });
      console.log("Project list response:", response);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Project list response:", data);
      return data;
    } catch (error) {
      console.error("Error fetching project list:", error);
      throw error;
    }
  },

  async getProjectByDeviceId(deviceId) {
    try {
      const response = await fetch(
        `${API_BASE_URL}/projects/device/${deviceId}`,
        {
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error fetching project by device ID:", error);
      throw error;
    }
  },

  async updateProject(projectId, projectData) {
    try {
      const response = await fetch(`${API_BASE_URL}/projects/${projectId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          projectName: projectData.projectName,
          description: projectData.description,
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error("Error updating project:", error);
      throw error;
    }
  },

  async getDeviceInfo(deviceId) {
    try {
      console.log("Fetching device info...", { deviceId });
      const response = await fetch(`${API_BASE_URL}/devices/${deviceId}`, {
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log("Device info received:", data);
      return data;
    } catch (error) {
      console.error("Error fetching device info:", error);
      throw error;
    }
  },

  async updateDeviceLocation(deviceId, locationData) {
    try {
      console.log("Updating device location...", { deviceId, locationData });
      const response = await fetch(
        `${API_BASE_URL}/devices/${deviceId}/location`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(locationData),
        }
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Location update response:", result);
      return result;
    } catch (error) {
      console.error("Error updating device location:", error);
      throw error;
    }
  },
};
