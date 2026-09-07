# Smart Vehicle Gate System

AI-powered smart gate management system with real-time monitoring, weather awareness, and role-based access control.

## Features

- 🚗 **AI Number Plate Recognition** - Advanced ML algorithms for vehicle identification
- 🌦️ **Weather Awareness** - Real-time weather monitoring for optimal gate operation
- 📡 **Real-time Monitoring** - Live tracking and instant notifications
- 🔒 **Secure Access Control** - Enterprise-grade security with JWT authentication
- 👥 **Role-Based Access Control** - Admin and User roles with granular permissions
- 📸 **Image Upload** - Vehicle photo upload with automatic compression
- 🎨 **Modern UI** - Beautiful, responsive design with dark/light mode

## Tech Stack

### Frontend
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Framer Motion
- React Router
- Axios

### Backend
- Node.js + Express
- JWT Authentication
- bcrypt for password hashing
- Multer for file uploads
- Sharp for image processing

## Quick Start

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd project
   ```

2. **Install frontend dependencies**
   ```bash
   npm install
   ```

3. **Install backend dependencies**
   ```bash
   cd server
   npm install
   cd ..
   ```

4. **Set up environment variables**

   Create `server/.env`:
   ```env
   PORT=3001
   JWT_SECRET=your-super-secret-jwt-key-change-this
   NODE_ENV=development
   ```

   Create `.env` in root:
   ```env
   VITE_API_URL=http://localhost:3001/api
   ```

5. **Start development servers**

   Terminal 1 (Backend):
   ```bash
   cd server
   npm run dev
   ```

   Terminal 2 (Frontend):
   ```bash
   npm run dev
   ```

6. **Access the application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001/api

## First User Setup

The first user to register automatically receives **admin** role. All subsequent users are assigned **user** role.

## Project Structure

```
project/
├── src/                 # Frontend React application
│   ├── components/     # Reusable components
│   ├── pages/          # Page components
│   ├── context/        # React contexts
│   └── utils/          # Utility functions
├── server/             # Backend Express API
│   ├── controllers/    # Route controllers
│   ├── routes/         # API routes
│   ├── middleware/     # Express middleware
│   └── utils/          # Backend utilities
└── public/             # Static assets
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user

### Events (Admin-only for POST)
- `GET /api/events` - Get vehicle events (all authenticated users)
- `POST /api/events` - Create event (admin only)

### Other
- `GET /api/weather` - Get weather conditions
- `POST /api/override` - Manual override (admin only)
- `POST /api/upload` - Upload vehicle image (admin only)
- `GET /api/health` - Health check

## Deployment

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed deployment instructions.

### Quick Deploy Options

1. **Vercel (Frontend) + Railway (Backend)** - Recommended
2. **Vercel (Frontend) + Render (Backend)**
3. **Full Stack on Railway**

## Environment Variables

### Backend
- `PORT` - Server port (default: 3001)
- `JWT_SECRET` - Secret key for JWT tokens
- `NODE_ENV` - Environment (development/production)
- `CORS_ORIGINS` - Allowed CORS origins (comma-separated)

### Frontend
- `VITE_API_URL` - Backend API URL

## Role-Based Access Control

### Admin
- Full dashboard access
- Manual override
- Vehicle logs
- Settings
- Create events
- Upload images

### User
- Dashboard (read-only)
- Live Feed (read-only)
- Weather
- Cannot create events or use admin features

## Development

### Running Tests
```bash
npm run lint
npm run typecheck
```

### Building for Production
```bash
# Frontend
npm run build

# Backend
cd server
npm start
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## License

ISC

## Support

For issues and questions, please open an issue on GitHub.

