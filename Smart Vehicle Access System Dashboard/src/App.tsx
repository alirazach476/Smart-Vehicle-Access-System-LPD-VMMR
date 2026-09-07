import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Signup from './pages/Signup';
import DashboardApp from './components/DashboardApp';

function App() {
  // Check if user is authenticated
  const isAuthenticated = () => {
    return !!localStorage.getItem('token');
  };

  // Protected Route Component
  const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    if (!isAuthenticated()) {
      return <Navigate to="/login" replace />;
    }
    return <>{children}</>;
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardApp />
            </ProtectedRoute>
          }
        />
        {/* Redirect any other route to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
