import mongoose from 'mongoose';

const vehicleEventSchema = new mongoose.Schema({
  plate: {
    type: String,
    required: true,
    index: true
  },
  make: {
    type: String,
    required: true
  },
  model: {
    type: String,
    required: true
  },
  confidence: {
    type: Number,
    required: true,
    min: 0,
    max: 1
  },
  weather: {
    type: String,
    required: true,
    enum: ['Fog', 'Rain', 'Cloudy', 'Sunny', 'Mist', 'Haze']
  },
  timestamp: {
    type: Date,
    required: true,
    default: Date.now,
    index: true
  },
  image: {
    type: String,
    required: true
  },
  status: {
    type: String,
    required: true,
    enum: ['Allowed', 'Denied']
  }
}, {
  timestamps: true
});

export default mongoose.model('VehicleEvent', vehicleEventSchema);

