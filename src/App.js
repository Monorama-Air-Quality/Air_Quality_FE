import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProjectView from "./components/ProjectView";
import DeviceInfoView from "./components/DeviceInfoView";
import BleDeviceMonitor from "./components/BleDeviceMonitor";
import AdminProject from "./components/AdminProject";
import AdminPage from "./components/AdminPage";
import UserPage from "./components/UserPage";
import SensorDataHistory from "./components/SensorDataHistory";

const router = createBrowserRouter([
  {
    path: "/info",
    element: <ProjectView />,
  },
  {
    path: "/device-info",
    element: <DeviceInfoView />,
  },
  {
    path: "/admin/project",
    element: <AdminProject />,
  },
  {
    path: "/admin",
    element: <AdminPage />,
  },
  {
    path: "/user",
    element: <UserPage />,
  },
  {
    path: "/user/history",
    element: <SensorDataHistory />,
  },
  {
    path: "/",
    element: <BleDeviceMonitor />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
