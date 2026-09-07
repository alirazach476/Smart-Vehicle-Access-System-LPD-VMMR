import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthForm from '../components/AuthForm';
import { authAPI } from '../utils/api';

export default function Login() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (data: { email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      const response = await authAPI.login(data.email, data.password);
      
      // Store token and user data (including role)
      localStorage.setItem('token', response.token);
      // Store user data including hasAdminAccess
      localStorage.setItem('user', JSON.stringify({
        ...response.user,
        hasAdminAccess: response.user.hasAdminAccess || false
      }));
      localStorage.setItem('role', response.user.role || 'user');
      
      // Redirect to dashboard
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-blue-950/20 dark:to-purple-950/20">
      <Navbar />
      
      <div className="pt-24 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-8"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring" }}
              className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-purple-600 shadow-lg shadow-blue-500/50 mb-4"
            >
              <Shield className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-extrabold mb-2">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 dark:from-blue-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
                Welcome Back
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Sign in to access your dashboard
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3, duration: 0.6 }}
            className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/20 dark:border-gray-700/30 shadow-2xl"
          >
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 rounded-t-3xl" />
            
            <AuthForm
              key="login-form"
              mode="login"
              onSubmit={handleSubmit}
              error={error}
              loading={loading}
            />

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Don't have an account?{' '}
                <Link
                  to="/signup"
                  className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>

            <Link
              to="/"
              className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
            >
              <ArrowLeft className="w-4 h-4" />
              Back to home
            </Link>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

