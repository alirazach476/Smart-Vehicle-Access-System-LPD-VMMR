import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Import routes
import predictRoutes from './routes/predict.js';
import eventsRoutes from './routes/events.js';
import weatherRoutes from './routes/weather.js';
import overrideRoutes from './routes/override.js';
import uploadRoutes from './routes/upload.js';
import authRoutes from './routes/auth.js';
import vehicleRoutes from './routes/vehicles.js';
import userManagementRoutes from './routes/userManagement.js';

// Import storage utilities
import { initializeStorage } from './utils/storage.js';
import { initializeUserDatabase } from './utils/userDatabase.js';

dotenv.config();

// Get port from environment or default to 3001
const PORT = process.env.PORT || 3001;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware
// CORS configuration - allow all origins in development, configure for production
const corsOptions = {
  origin: process.env.CORS_ORIGINS 
    ? process.env.CORS_ORIGINS.split(',')
    : '*', // Allow all origins in development
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (sample images and uploads)
app.use('/samples', express.static(path.join(__dirname, 'public', 'samples')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));
app.use(express.static(path.join(__dirname, 'public')));

// Root route
app.get('/', (req, res) => {
  res.json({
    message: 'Smart Vehicle Gate System API',
    version: '1.0.0',
    endpoints: {
      health: '/api/health',
      predict: 'POST /api/predict',
      events: 'GET /api/events',
      createEvent: 'POST /api/events',
      weather: 'GET /api/weather',
      override: 'POST /api/override',
      upload: 'POST /api/upload',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    },
    documentation: 'See README.md for detailed API documentation'
  });
});

// API info route
app.get('/api', (req, res) => {
  res.json({
    message: 'Smart Vehicle Gate System API',
    version: '1.0.0',
    status: 'running',
    endpoints: {
      health: {
        method: 'GET',
        path: '/api/health',
        description: 'Health check endpoint'
      },
      predict: {
        method: 'POST',
        path: '/api/predict',
        description: 'Get dummy vehicle prediction with glare removal'
      },
      getEvents: {
        method: 'GET',
        path: '/api/events',
        description: 'Get vehicle events with pagination and filters',
        queryParams: ['page', 'limit', 'search', 'status', 'weather', 'make', 'model']
      },
      createEvent: {
        method: 'POST',
        path: '/api/events',
        description: 'Create a new vehicle event'
      },
      weather: {
        method: 'GET',
        path: '/api/weather',
        description: 'Get current weather conditions'
      },
      override: {
        method: 'POST',
        path: '/api/override',
        description: 'Create manual override for vehicle or gate'
      },
      upload: {
        method: 'POST',
        path: '/api/upload',
        description: 'Upload and compress vehicle image'
      },
      register: {
        method: 'POST',
        path: '/api/auth/register',
        description: 'Register a new user account'
      },
      login: {
        method: 'POST',
        path: '/api/auth/login',
        description: 'Login user and get JWT token'
      }
    }
  });
});

// API Routes
app.use('/api/predict', predictRoutes);
app.use('/api/events', eventsRoutes);
app.use('/api/weather', weatherRoutes);
app.use('/api/override', overrideRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/users', userManagementRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Vehicle Gate System API is running' });
});


// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
});

// 404 handler for undefined routes
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path,
    method: req.method,
    availableEndpoints: {
      root: 'GET /',
      apiInfo: 'GET /api',
      health: 'GET /api/health',
      predict: 'POST /api/predict',
      getEvents: 'GET /api/events',
      createEvent: 'POST /api/events',
      weather: 'GET /api/weather',
      override: 'POST /api/override',
      upload: 'POST /api/upload',
      register: 'POST /api/auth/register',
      login: 'POST /api/auth/login'
    }
  });
});

// Initialize storage and start server
async function startServer() {
  // Initialize in-memory storage
  try {
    initializeStorage();
  } catch (error) {
    console.error('❌ Error initializing storage:', error);
  }

  // Initialize user database (persistent storage)
  try {
    await initializeUserDatabase();
  } catch (error) {
    console.error('❌ Error initializing user database:', error);
  }

  // Start server
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`📡 API endpoints available at http://localhost:${PORT}/api`);
    console.log(`💚 Health check: http://localhost:${PORT}/api/health`);
    console.log(`🌍 Environment: ${process.env.NODE_ENV || 'development'}`);
  });
}

// Start the server
startServer().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

export default app;

