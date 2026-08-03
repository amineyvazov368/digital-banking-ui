import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import useAuth from './hooks/useAuth';
import AppRoutes from './routes/routes';
import './App.css';

const AppContent = () => {
  const { user } = useAuth();

  return (
    <NotificationProvider userId={user?.id}>
      <div className="app-wrapper">
        <AppRoutes />
      </div>
    </NotificationProvider>
  );
};

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;