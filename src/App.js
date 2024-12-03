import { createBrowserRouter, RouterProvider } from "react-router-dom";
import ProjectView from "./components/ProjectView";
import DeviceInfoView from "./components/DeviceInfoView";
import BleDeviceMonitor from "./components/BleDeviceMonitor";

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
    path: "/",
    element: <BleDeviceMonitor />,
  },
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;
