import { createBrowserRouter, RouterProvider } from "react-router-dom";
import Dashboard from "../pages/dashboard";
import Presale from "../pages/presale";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Presale />,
  },

  {
    path: "/buy",
    element: <Presale />,
  },

  {
    path: "/dashboard",
    element: <Dashboard />,
  },
]);

const RoutesProvider = () => {
  return <RouterProvider router={router} />;
};

export default RoutesProvider;
