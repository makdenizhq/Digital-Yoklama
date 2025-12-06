
import React, { useState } from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Registration from './pages/Registration';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Students from './pages/Students'; 
import { ViewState } from './types';

const AppContent = () => {
  const { currentUser } = useAppContext();
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'scan': return <Scanner />;
      case 'register': return <Registration />;
      case 'students': return <Students />;
      case 'reports': return <Reports />;
      case 'settings': return <Settings />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {renderView()}
    </Layout>
  );
};

const App = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
