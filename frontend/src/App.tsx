import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './index.css';

import Login from './pages/Login';
import Signup from './pages/Signup';

import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/admin/*" element={<AdminDashboard />} />
        <Route path="/client/*" element={<ClientDashboard />} />
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
