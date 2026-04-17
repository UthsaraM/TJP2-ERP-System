/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { createBrowserRouter, RouterProvider } from "react-router-dom";
import AppLayout from "./components/layout/app-layout";
import Dashboard from "./pages/Index";
import Orders from "./pages/Orders";
import Schedule from "./pages/Schedule";
import Tracking from "./pages/Tracking";
import { HerculesAuthProvider } from "./providers/auth-provider";

const router = createBrowserRouter([
  {
    path: "/",
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <Dashboard />
      },
      {
        path: "orders",
        element: <Orders />
      },
      {
        path: "schedule",
        element: <Schedule />
      },
      {
        path: "tracking",
        element: <Tracking />
      }
    ]
  }
]);

export default function App() {
  return (
    <HerculesAuthProvider>
      <RouterProvider router={router} />
    </HerculesAuthProvider>
  );
}
