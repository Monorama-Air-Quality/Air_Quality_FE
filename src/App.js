import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import ProjectView from './components/ProjectView';
import BleDeviceMonitor from './components/BleDeviceMonitor';

const router = createBrowserRouter([
  {
    path: "/info",
    element: <ProjectView />,
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