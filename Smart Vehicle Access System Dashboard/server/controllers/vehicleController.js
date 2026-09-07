import { addVehicle, getVehicles, getVehicleById, updateVehicle, deleteVehicle, cleanupExpiredVehicles } from '../utils/storage.js';
import { findUserById } from '../utils/authStorage.js';

/**
 * POST /api/vehicles/add
 * Add a new vehicle with access control
 */
export async function addVehicleHandler(req, res) {
  try {
    const { licensePlate, make, model, ownerName, notes, accessType, entryTime, expiry } = req.body;
    const userId = req.user.id;
    const userRole = req.user.role;

    // Validate required fields
    if (!licensePlate || !make || !model || !accessType) {
      return res.status(400).json({ error: 'Missing required fields: licensePlate, make, model, accessType' });
    }

    // Validate accessType
    const validAccessTypes = ['allow', 'deny', 'temp'];
    if (!validAccessTypes.includes(accessType)) {
      return res.status(400).json({ error: `Invalid accessType. Must be one of: ${validAccessTypes.join(', ')}` });
    }

    // Role-based validation
    if (userRole !== 'admin') {
      // Regular users can only add temporary visitors
      if (accessType !== 'temp') {
        return res.status(403).json({ error: 'Regular users can only add temporary visitors' });
      }
    }

    // Validate entry time and expiry for temporary visitors
    if (accessType === 'temp') {
      if (!entryTime) {
        return res.status(400).json({ error: 'Entry time is required for temporary visitors' });
      }
      if (!expiry) {
        return res.status(400).json({ error: 'Expiry date is required for temporary visitors' });
      }
      const entryDate = new Date(entryTime);
      const expiryDate = new Date(expiry);
      const now = new Date();
      
      if (expiryDate <= entryDate) {
        return res.status(400).json({ error: 'Expiry time must be after entry time' });
      }
      if (expiryDate <= now) {
        return res.status(400).json({ error: 'Expiry date must be in the future' });
      }
    } else {
      // Permanent rules should not have entry time or expiry
      if (entryTime) {
        return res.status(400).json({ error: 'Entry time is only allowed for temporary visitors' });
      }
      if (expiry) {
        return res.status(400).json({ error: 'Expiry date is only allowed for temporary visitors' });
      }
    }

    // Handle photo upload
    let photoPath = null;
    if (req.file) {
      photoPath = `/uploads/vehicles/${req.file.filename}`;
    }

    // Get user info for response
    const user = findUserById(userId);
    const addedByInfo = user ? {
      username: user.username,
      email: user.email
    } : null;

    // Create vehicle
    const vehicle = addVehicle({
      licensePlate,
      make,
      model,
      ownerName: ownerName || '',
      notes: notes || '',
      accessType,
      entryTime: accessType === 'temp' ? entryTime : null,
      expiry: accessType === 'temp' ? expiry : null,
      photo: photoPath,
      addedBy: userId,
      role: userRole
    });

    res.status(201).json({
      message: 'Vehicle added successfully',
      vehicle: {
        ...vehicle,
        addedByInfo
      }
    });
  } catch (error) {
    console.error('Error adding vehicle:', error);
    res.status(500).json({ error: 'Failed to add vehicle' });
  }
}

/**
 * GET /api/vehicles
 * Get all vehicles (with optional filters)
 * NOTE: Returns ALL vehicles regardless of who added them
 * This ensures user-added temporary vehicles are visible to admins in Manual Override
 */
export async function getVehiclesHandler(req, res) {
  try {
    // Clean up expired vehicles first
    cleanupExpiredVehicles();

    const { search, accessType } = req.query;
    const filters = {};
    if (search) filters.search = search;
    if (accessType) filters.accessType = accessType;

    // Get all vehicles (admin and user-added) - no filtering by user
    let vehicles = getVehicles(filters);

    // Get user info for each vehicle
    const vehiclesWithUserInfo = vehicles.map(vehicle => {
      const user = findUserById(vehicle.addedBy);
      return {
        ...vehicle,
        addedByInfo: user ? {
          username: user.username,
          email: user.email
        } : null
      };
    });

    res.json({
      vehicles: vehiclesWithUserInfo,
      count: vehiclesWithUserInfo.length
    });
  } catch (error) {
    console.error('Error fetching vehicles:', error);
    res.status(500).json({ error: 'Failed to fetch vehicles' });
  }
}

/**
 * GET /api/vehicles/:id
 * Get vehicle by ID
 */
export async function getVehicleByIdHandler(req, res) {
  try {
    const { id } = req.params;
    const vehicle = getVehicleById(id);

    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check if expired (for temporary visitors)
    if (vehicle.accessType === 'temp' && vehicle.expiry && new Date(vehicle.expiry) < new Date()) {
      return res.status(404).json({ error: 'Vehicle access has expired' });
    }

    const user = findUserById(vehicle.addedBy);
    const vehicleWithUserInfo = {
      ...vehicle,
      addedByInfo: user ? {
        username: user.username,
        email: user.email
      } : null
    };

    res.json(vehicleWithUserInfo);
  } catch (error) {
    console.error('Error fetching vehicle:', error);
    res.status(500).json({ error: 'Failed to fetch vehicle' });
  }
}

/**
 * PUT /api/vehicles/:id
 * Update vehicle
 */
export async function updateVehicleHandler(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
    const { licensePlate, make, model, ownerName, notes, accessType, entryTime, expiry } = req.body;

    const vehicle = getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check permissions: admin can edit any, users can only edit their own
    if (userRole !== 'admin' && vehicle.addedBy !== userId) {
      return res.status(403).json({ error: 'You can only edit vehicles you added' });
    }

    // Role-based validation for accessType changes
    if (accessType && userRole !== 'admin') {
      // Regular users cannot change accessType or add permanent rules
      if (accessType !== 'temp') {
        return res.status(403).json({ error: 'Regular users can only use temporary visitor access type' });
      }
      // Regular users cannot change from temp to permanent
      if (vehicle.accessType !== 'temp' && accessType === 'temp') {
        return res.status(403).json({ error: 'Cannot change permanent rule to temporary' });
      }
    }

    // Validate entry time and expiry for temporary visitors
    const finalAccessType = accessType || vehicle.accessType;
    if (finalAccessType === 'temp') {
      const entryTimeToUse = entryTime !== undefined ? entryTime : vehicle.entryTime;
      const expiryToUse = expiry !== undefined ? expiry : vehicle.expiry;
      
      if (!entryTimeToUse) {
        return res.status(400).json({ error: 'Entry time is required for temporary visitors' });
      }
      if (!expiryToUse) {
        return res.status(400).json({ error: 'Expiry date is required for temporary visitors' });
      }
      
      const entryDate = new Date(entryTimeToUse);
      const expiryDate = new Date(expiryToUse);
      const now = new Date();
      
      if (expiryDate <= entryDate) {
        return res.status(400).json({ error: 'Expiry time must be after entry time' });
      }
      if (expiryDate <= now) {
        return res.status(400).json({ error: 'Expiry date must be in the future' });
      }
    }

    // Handle photo upload
    let photoPath = vehicle.photo;
    if (req.file) {
      photoPath = `/uploads/vehicles/${req.file.filename}`;
    }

    const updates = {};
    if (licensePlate) updates.licensePlate = licensePlate.toUpperCase().trim();
    if (make) updates.make = make;
    if (model) updates.model = model;
    if (ownerName !== undefined) updates.ownerName = ownerName;
    if (notes !== undefined) updates.notes = notes;
    if (accessType) updates.accessType = accessType;
    if (entryTime !== undefined) updates.entryTime = finalAccessType === 'temp' ? entryTime : null;
    if (expiry !== undefined) updates.expiry = finalAccessType === 'temp' ? expiry : null;
    if (photoPath) updates.photo = photoPath;

    const updatedVehicle = updateVehicle(id, updates);
    if (!updatedVehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    const user = findUserById(updatedVehicle.addedBy);
    res.json({
      message: 'Vehicle updated successfully',
      vehicle: {
        ...updatedVehicle,
        addedByInfo: user ? {
          username: user.username,
          email: user.email
        } : null
      }
    });
  } catch (error) {
    console.error('Error updating vehicle:', error);
    res.status(500).json({ error: 'Failed to update vehicle' });
  }
}

/**
 * DELETE /api/vehicles/:id
 * Delete vehicle
 */
export async function deleteVehicleHandler(req, res) {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;

    const vehicle = getVehicleById(id);
    if (!vehicle) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    // Check permissions: admin can delete any, users can only delete their own
    if (userRole !== 'admin' && vehicle.addedBy !== userId) {
      return res.status(403).json({ error: 'You can only delete vehicles you added' });
    }

    const deleted = deleteVehicle(id);
    if (!deleted) {
      return res.status(404).json({ error: 'Vehicle not found' });
    }

    res.json({ message: 'Vehicle deleted successfully' });
  } catch (error) {
    console.error('Error deleting vehicle:', error);
    res.status(500).json({ error: 'Failed to delete vehicle' });
  }
}

