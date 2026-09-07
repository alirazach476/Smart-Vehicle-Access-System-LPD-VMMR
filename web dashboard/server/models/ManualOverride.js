import mongoose from 'mongoose';

const manualOverrideSchema = new mongoose.Schema({
  vehicle: {
    plate: {
      type: String,
      required: true
    },
    make: {
      type: String,
      default: ''
    },
    model: {
      type: String,
      default: ''
    }
  },
  action: {
    type: String,
    required: true,
    enum: ['Allowed', 'Denied', 'Open', 'Close']
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

export default mongoose.model('ManualOverride', manualOverrideSchema);

