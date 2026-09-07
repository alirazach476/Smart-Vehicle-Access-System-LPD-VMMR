# Quick Setup Guide

## Prerequisites
- Node.js (v18 or higher)

## Installation Steps

1. **Navigate to server directory:**
   ```bash
   cd server
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure environment (optional):**
   ```bash
   # Copy .env.example to .env (if not exists)
   # Edit .env to set PORT if needed (default: 3001)
   ```

4. **Run the server:**
   ```bash
   npm start
   # or for development:
   npm run dev
   ```

5. **Verify:**
   - Server should start on `http://localhost:3001`
   - Check health: `http://localhost:3001/api/health`
   - Dummy data (100 vehicles) will be loaded from `data/dummyEvents.json` on startup

## API Testing

### Test Predict Endpoint
```bash
curl -X POST http://localhost:3001/api/predict
```

### Test Events Endpoint
```bash
curl http://localhost:3001/api/events?page=1&limit=10
```

### Test Weather Endpoint
```bash
curl http://localhost:3001/api/weather
```

### Test Override Endpoint
```bash
curl -X POST http://localhost:3001/api/override \
  -H "Content-Type: application/json" \
  -d '{"vehicle":{"plate":"LEA-1001","make":"Toyota","model":"Corolla"},"action":"Allowed"}'
```

## Notes
- Sample images should be placed in `server/public/samples/` (vehicle_1.jpg through vehicle_100.jpg)
- The system uses in-memory storage (no database required)
- Data is loaded from `data/dummyEvents.json` on startup
- All images are served from `/samples/` endpoint
- Data persists only during server runtime (resets on restart)

