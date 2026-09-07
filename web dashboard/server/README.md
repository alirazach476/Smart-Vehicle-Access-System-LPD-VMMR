# Smart Vehicle Gate System - Backend API

Backend API for the Smart Vehicle Gate System dashboard built with Node.js and Express. Uses in-memory storage (no database required).

## 🚀 Setup

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables (optional):
```bash
cp .env.example .env
```

Edit `.env` and configure:
- `PORT` - Server port (default: 3001)

3. Run the server:
```bash
npm start
# or for development with auto-reload:
npm run dev
```

**Note:** The backend uses in-memory storage (no database required). Data is loaded from `data/dummyEvents.json` on startup.

## 📡 API Endpoints

### POST /api/predict
Returns dummy prediction with vehicle details.

**Response:**
```json
{
  "plate": "LEA-1001",
  "make": "Toyota",
  "model": "Corolla",
  "confidence": 0.91,
  "weather": "Fog",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "image": "/samples/vehicle_1.jpg",
  "status": "Allowed"
}
```

### GET /api/events
Get historical vehicle logs with pagination, search, and filters.

**Query Parameters:**
- `page` - Page number (default: 1)
- `limit` - Items per page (default: 20)
- `search` - Search by license plate
- `status` - Filter by status (Allowed/Denied)
- `weather` - Filter by weather condition
- `make` - Filter by vehicle make
- `model` - Filter by vehicle model

**Response:**
```json
{
  "events": [...],
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 100,
    "pages": 5
  }
}
```

### POST /api/events
Add new vehicle event (manual or simulation).

**Request Body:**
```json
{
  "plate": "LEA-1001",
  "make": "Toyota",
  "model": "Corolla",
  "confidence": 0.91,
  "weather": "Fog",
  "timestamp": "2025-01-15T10:30:00.000Z",
  "image": "/samples/vehicle_1.jpg",
  "status": "Allowed"
}
```

### GET /api/weather
Get current weather conditions.

**Response:**
```json
{
  "condition": "Fog",
  "visibility": "Low",
  "temp": 14
}
```

### POST /api/override
Admin manual override for vehicles or gate status.

**Request Body:**
```json
{
  "vehicle": {
    "plate": "LEA-1001",
    "make": "Toyota",
    "model": "Corolla"
  },
  "action": "Allowed"
}
```

**Actions:** `Allowed`, `Denied`, `Open`, `Close`

## 📦 Data Structure

### VehicleEvents (In-Memory Storage)
- `id` (Number) - Unique event ID
- `plate` (String) - License plate number
- `make` (String) - Vehicle make
- `model` (String) - Vehicle model
- `confidence` (Number) - Detection confidence (0.82-0.98)
- `weather` (String) - Weather condition (Fog, Rain, Cloudy, Sunny, Mist, Haze)
- `timestamp` (Date) - Event timestamp
- `image` (String) - Image path
- `status` (String) - Allowed or Denied

### ManualOverrides (In-Memory Storage)
- `id` (Number) - Unique override ID
- `vehicle` (Object) - Vehicle information (plate, make, model)
- `action` (String) - Override action
- `timestamp` (Date) - Override timestamp

## 🖼️ Image Processing

The system includes internal sun glare removal preprocessing using Sharp library. Images are processed before being returned in predictions.

## 📂 Folder Structure

```
server/
  ├── controllers/     # Request handlers
  ├── models/         # Mongoose models
  ├── routes/         # Express routes
  ├── utils/          # Utility functions
  ├── public/         # Static files (sample images)
  │   └── samples/    # Vehicle images
  ├── index.js        # Main server file
  └── package.json    # Dependencies
```

## 🔧 Features

- ✅ Dummy data generation (100 vehicles)
- ✅ Image glare removal preprocessing
- ✅ Pagination and filtering
- ✅ Search functionality
- ✅ Weather simulation
- ✅ Manual override system
- ✅ In-memory storage (no database required)

