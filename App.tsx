
import React from 'react';
import { AppProvider, useAppContext } from './context/AppContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Settings from './pages/Settings';
import Login from './pages/Login';
import Profile from './pages/Profile';
import Students from './pages/Students';
import Attendance from './pages/Attendance';
import Education from './pages/Education';
import CalendarPage from './pages/Calendar'; 
import Finance from './pages/Finance'; 

const AppContent = () => {
  const { currentUser, currentView, navigateTo } = useAppContext();

  if (!currentUser) {
    return <Login />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard': return <Dashboard />;
      case 'students': return <Students />;
      case 'attendance': return <Attendance />;
      case 'education': return <Education />;
      case 'calendar': return <CalendarPage />;
      case 'finance': return <Finance />; 
      case 'settings': return <Settings />;
      case 'profile': return <Profile />;
      default: return <Dashboard />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={navigateTo}>
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
