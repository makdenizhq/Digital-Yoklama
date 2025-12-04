import React, { useState } from 'react';
import { AppProvider } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Scanner from './pages/Scanner';
import Registration from './pages/Registration';
import Reports from './pages/Reports';
import { ViewState } from './types';

const App = () => {
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'scan': return <Scanner />;
      case 'register': return <Registration />;
      case 'reports': return <Reports />;
      default: return <Dashboard />;
    }
  };

  return (
    <AppProvider>
      <Layout currentView={currentView} onNavigate={setCurrentView}>
        {renderView()}
      </Layout>
    </AppProvider>
  );
};

export default App;
