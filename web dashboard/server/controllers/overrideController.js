import { addManualOverride } from '../utils/storage.js';

/**
 * POST /api/override
 * Admin can manually add/approve vehicles or trigger gate status
 */
export async function createOverride(req, res) {
  try {
    const {
      vehicle,
      action
    } = req.body;
    
    // Validate required fields
    if (!vehicle || !vehicle.plate || !action) {
      return res.status(400).json({ error: 'Missing required fields: vehicle.plate and action' });
    }
    
    // Validate action
    const validActions = ['Allowed', 'Denied', 'Open', 'Close'];
    if (!validActions.includes(action)) {
      return res.status(400).json({ error: `Invalid action. Must be one of: ${validActions.join(', ')}` });
    }
    
    // Create override
    const override = addManualOverride({
      vehicle: {
        plate: vehicle.plate,
        make: vehicle.make || '',
        model: vehicle.model || ''
      },
      action
    });
    
    res.status(201).json({
      message: `Override applied: ${action} for vehicle ${vehicle.plate}`,
      override
    });
  } catch (error) {
    console.error('Error creating override:', error);
    res.status(500).json({ error: 'Failed to create override' });
  }
}

