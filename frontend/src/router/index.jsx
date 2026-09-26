import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import AdminLayout from '../layouts/AdminLayout';
import ProtectedRoute from '../components/admin/ProtectedRoute';

// Public Pages
import Home from '../pages/public/Home';
import Success from '../pages/public/Success';
import CheckStatus from '../pages/public/CheckStatus';

// Admin Pages
import Login from '../pages/admin/Login';
import Dashboard from '../pages/admin/Dashboard';
import DataPendaftar from '../pages/admin/DataPendaftar';
import CetakKartuUjian from '../pages/admin/CetakKartuUjian';
import Pengaturan from '../pages/admin/Pengaturan';
import PrintKwitansi from '../pages/admin/PrintKwitansi';
import PrintKartu from '../pages/admin/PrintKartu';

const router = createBrowserRouter([
  // Public Routes
  {
    path: '/',
    element: <PublicLayout />,
    children: [
      { index: true, element: <Home /> },
      { path: 'pendaftaran-sukses', element: <Success /> },
      { path: 'cek-status', element: <CheckStatus /> },
    ],
  },

  // Admin Login
  {
    path: '/admin/login',
    element: <Login />,
  },

  // Admin Protected Routes
  {
    path: '/admin',
    element: (
      <ProtectedRoute>
        <AdminLayout />
      </ProtectedRoute>
    ),
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: 'dashboard', element: <Dashboard /> },
      { path: 'data-pendaftar', element: <DataPendaftar /> },
      { path: 'cetak-kartu', element: <CetakKartuUjian /> },
      { path: 'pengaturan', element: <Pengaturan /> },
    ],
  },

  // Direct Print Routes (Stand-alone without admin layout)
  {
    path: '/admin/print/kwitansi/:id',
    element: (
      <ProtectedRoute>
        <PrintKwitansi />
      </ProtectedRoute>
    ),
  },
  {
    path: '/admin/print/kartu/:id',
    element: (
      <ProtectedRoute>
        <PrintKartu />
      </ProtectedRoute>
    ),
  },

  // Catch-all
  {
    path: '*',
    element: <Navigate to="/" replace />,
  },
]);

export default router;
