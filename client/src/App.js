import { Routes, Route, Navigate } from 'react-router-dom';
import { NhostClient, NhostProvider, useAuthenticated } from '@nhost/react';
import './App.css';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import ChatbotPage from './pages/ChatbotPage';

const nhost = new NhostClient({
  subdomain: process.env.REACT_APP_NHOST_SUBDOMAIN,
  region: process.env.REACT_APP_NHOST_REGION,
});

function ProtectedRoute({ children }) {
  const isAuthenticated = useAuthenticated();
  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }
  return children;
}

function PublicRoute({ children }) {
  const isAuthenticated = useAuthenticated();
  if (isAuthenticated) {
    return <Navigate to="/chatbot" />;
  }
  return children;
}

function App() {
  return (
    <NhostProvider nhost={nhost}>
      <div className="App">
        <Routes>
          <Route path="/" element={<PublicRoute><LandingPage /></PublicRoute>} />
          <Route path="/chatbot" element={<ProtectedRoute><ChatbotPage /></ProtectedRoute>} />
          <Route path="/login" element={<PublicRoute><LoginPage /></PublicRoute>} />
          <Route path="/signup" element={<PublicRoute><SignupPage /></PublicRoute>} />
        </Routes>
      </div>
    </NhostProvider>
  );
}

export default App;
