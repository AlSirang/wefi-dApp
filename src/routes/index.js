import { createBrowserRouter, RouterProvider } from "react-router-dom";
import DashboardPage from "../pages/dashboard";
import PresalePage from "../pages/presale";

const router = createBrowserRouter([
  {
    path: "/",
    element: <PresalePage />,
  },

  {
    path: "/buy",
    element: <PresalePage />,
  },

  {
    path: "/dashboard",
    element: <DashboardPage />,
  },
]);

const RoutesProvider = () => {
  return <RouterProvider router={router} />;
};

export default RoutesProvider;
