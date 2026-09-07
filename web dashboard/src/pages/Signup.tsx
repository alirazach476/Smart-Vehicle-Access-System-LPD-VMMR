import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Shield, ArrowLeft, CheckCircle2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import AuthForm from '../components/AuthForm';
import { authAPI } from '../utils/api';

export default function Signup() {
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (data: { username: string; email: string; password: string }) => {
    setError('');
    setLoading(true);

    try {
      await authAPI.register(data.username, data.email, data.password);
      setSuccess(true);
      
      // Redirect to login after 2 seconds
      setTimeout(() => {
        navigate('/login');
      }, 2000);
    } catch (err: any) {
      setError(err.response?.data?.error || err.message || 'Registration failed. Please try again.');
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
                Create Account
              </span>
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Join Smart Gate and get started today
            </p>
          </motion.div>

          {success ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border-2 border-green-200 dark:border-green-800 shadow-2xl text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
                className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 mb-4"
              >
                <CheckCircle2 className="w-8 h-8 text-white" />
              </motion.div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                Account Created!
              </h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Redirecting to login page...
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="relative bg-white/70 dark:bg-gray-800/70 backdrop-blur-2xl rounded-3xl p-8 border-2 border-white/20 dark:border-gray-700/30 shadow-2xl"
            >
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-60 rounded-t-3xl" />
              
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border-2 border-red-200 dark:border-red-800 rounded-xl"
                >
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400">{error}</p>
                </motion.div>
              )}
              
              <AuthForm
                key="signup-form"
                mode="signup"
                onSubmit={handleSubmit}
                error={error}
                loading={loading}
              />

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
                  >
                    Sign in
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
          )}
        </div>
      </div>
    </div>
  );
}

