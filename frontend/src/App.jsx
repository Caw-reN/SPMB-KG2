import React from 'react';
import { RouterProvider } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import router from './router';
import { Toaster } from 'react-hot-toast';

function App() {
  return (
    <AuthProvider>
      <Toaster position="top-right" toastOptions={{
        duration: 4000,
        style: {
          background: '#363636',
          color: '#fff',
        },
        success: {
          style: {
            background: '#047857',
            color: 'white',
          },
          iconTheme: {
            primary: 'white',
            secondary: '#047857',
          },
        },
      }} />
      <RouterProvider router={router} />
    </AuthProvider>
  );
}

export default App;
