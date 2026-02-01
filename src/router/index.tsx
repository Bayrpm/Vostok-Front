import { createBrowserRouter, Navigate } from 'react-router-dom';
import AuthLayout from '../layouts/Auth/AuthLayout';
import DashboardLayout from '../layouts/Dashboard/DashboardLayout';
import LoginPage from '../features/auth/pages/LoginPage';
import InventoryPage from '../features/inventory/pages/InventoryPage';
import MovementsPage from '../features/movements/pages/MovementsPage';

/**
 * Application router configuration
 */
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/auth',
    element: <AuthLayout />,
    children: [
      {
        path: 'login',
        element: <LoginPage />,
      },
    ],
  },
  {
    path: '/dashboard',
    element: <DashboardLayout />,
    children: [
      {
        index: true,
        element: <Navigate to="/dashboard/inventory" replace />,
      },
      {
        path: 'inventory',
        element: <InventoryPage />,
      },
      {
        path: 'movements',
        element: <MovementsPage />,
      },
    ],
  },
]);
