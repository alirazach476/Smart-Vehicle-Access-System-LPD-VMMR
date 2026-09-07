/**
 * In-memory storage for vehicle events and overrides
 * Replaces MongoDB for simpler setup
 */
import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';
import { generateDummyEvents } from './dummyData.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Data directory and file paths
const DATA_DIR = path.join(__dirname, '..', 'data');
const VEHICLES_FILE = path.join(DATA_DIR, 'vehicles.json');

// In-memory storage
let vehicleEvents = [];
let manualOverrides = [];
let vehicles = []; // New: stores vehicle access rules
let nextEventId = 1;
let nextOverrideId = 1;
let nextVehicleId = 1;

/**
 * Ensure data directory exists
 */
function ensureDataDir() {
  try {
    mkdirSync(DATA_DIR, { recursive: true });
  } catch (error) {
    console.error('Error creating data directory:', error);
  }
}

/**
 * Load vehicles from JSON file (only permanent vehicles)
 */
function loadVehicles() {
  try {
    ensureDataDir();
    const fileData = readFileSync(VEHICLES_FILE, 'utf-8');
    const data = JSON.parse(fileData);
    
    if (data.vehicles && Array.isArray(data.vehicles)) {
      // Only load permanent vehicles (allow/deny), not temporary ones
      const permanentVehicles = data.vehicles.filter(v => 
        v.accessType === 'allow' || v.accessType === 'deny'
      );
      
      vehicles = permanentVehicles;
      // Calculate nextVehicleId from existing vehicles or use saved value
      if (data.nextVehicleId) {
        nextVehicleId = data.nextVehicleId;
      } else if (vehicles.length > 0) {
        nextVehicleId = Math.max(...vehicles.map(v => v.id || 0), 0) + 1;
      } else {
        nextVehicleId = 1;
      }
      
      console.log(`✅ Loaded ${vehicles.length} permanent vehicle(s) from storage`);
      return;
    }
  } catch (error) {
    if (error.code === 'ENOENT') {
      // File doesn't exist, start fresh
      console.log('📝 No existing vehicles file, starting fresh');
    } else {
      console.error('⚠️  Error loading vehicles:', error.message);
    }
  }
  
  vehicles = [];
  nextVehicleId = 1;
}

/**
 * Save vehicles to JSON file (only permanent vehicles)
 */
function saveVehicles() {
  try {
    ensureDataDir();
    
    // Only save permanent vehicles (allow/deny)
    const permanentVehicles = vehicles.filter(v => 
      v.accessType === 'allow' || v.accessType === 'deny'
    );
    
    const data = {
      vehicles: permanentVehicles,
      nextVehicleId: nextVehicleId,
      lastUpdated: new Date().toISOString()
    };
    
    writeFileSync(VEHICLES_FILE, JSON.stringify(data, null, 2), 'utf-8');
  } catch (error) {
    console.error('❌ Error saving vehicles:', error.message);
  }
}

/**
 * Initialize storage with dummy data
 */
export function initializeStorage() {
  try {
    // Load permanent vehicles from persistent storage
    loadVehicles();
    
    // Try to load from JSON file
    const dataPath = path.join(__dirname, '..', 'data', 'dummyEvents.json');
    
    // Check if file exists
    try {
      const fileData = JSON.parse(readFileSync(dataPath, 'utf-8'));
      
      if (Array.isArray(fileData) && fileData.length > 0) {
        vehicleEvents = fileData.map((event) => ({
          id: nextEventId++,
          plate: event.plate || `LEA-${1001 + nextEventId}`,
          make: event.make || 'Unknown',
          model: event.model || 'Unknown',
          confidence: event.confidence || (Math.random() * 0.16 + 0.82),
          weather: event.weather || 'Sunny',
          timestamp: event.timestamp ? new Date(event.timestamp) : new Date(),
          image: event.image || `/samples/vehicle_${(nextEventId % 100) + 1}.jpg`,
          status: event.status || 'Allowed',
          createdAt: new Date(),
          updatedAt: new Date()
        }));
        
        console.log(`✅ Loaded ${vehicleEvents.length} vehicle events from dummy data`);
        return;
      }
    } catch (fileError) {
      console.log('⚠️  Could not load from file, generating dummy data...');
    }
    
    // If file doesn't exist or is invalid, generate dummy data
    console.log('📦 Generating dummy data...');
    const dummyEvents = generateDummyEvents(100);
    vehicleEvents = dummyEvents.map((event) => ({
      id: nextEventId++,
      ...event,
      timestamp: event.timestamp instanceof Date ? event.timestamp : new Date(event.timestamp),
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    console.log(`✅ Generated ${vehicleEvents.length} dummy vehicle events`);
  } catch (error) {
    console.error('❌ Error initializing storage:', error.message);
    // Initialize with empty array as fallback
    vehicleEvents = [];
    console.log('⚠️  Storage initialized with empty array');
  }
}

/**
 * Get all vehicle events with filters
 * Automatically filters out events from expired temporary vehicles
 */
export function getVehicleEvents(filters = {}) {
  const now = new Date();
  let filtered = [...vehicleEvents];
  
  // Filter out events from expired temporary vehicles or before entry time
  filtered = filtered.filter(e => {
    if (e.temporaryAccess) {
      // Check expiry
      if (e.expiry) {
        const expiryDate = new Date(e.expiry);
        if (expiryDate <= now) {
          return false; // Expired
        }
      }
      // Check entry time
      if (e.entryTime) {
        const entryDate = new Date(e.entryTime);
        if (entryDate > now) {
          return false; // Entry time not reached yet
        }
      }
    }
    return true;
  });
  
  // Remove duplicate events (additional safeguard)
  // This handles any duplicates that may have been created before deduplication was added
  const seenEvents = new Map();
  filtered = filtered.filter(e => {
    const normalizedPlate = e.plate.toUpperCase().trim();
    const eventTimestamp = new Date(e.timestamp);
    
    // For temporary vehicles, use plate + entryTime + expiry as unique key
    if (e.temporaryAccess && e.entryTime && e.expiry) {
      const key = `${normalizedPlate}_${new Date(e.entryTime).toISOString()}_${new Date(e.expiry).toISOString()}`;
      if (seenEvents.has(key)) {
        // Keep the most recent one
        const existing = seenEvents.get(key);
        if (eventTimestamp > new Date(existing.timestamp)) {
          seenEvents.set(key, e);
          return true;
        }
        return false;
      }
      seenEvents.set(key, e);
      return true;
    }
    
    // For permanent vehicles, use plate + timestamp window (10 seconds) as unique key
    // This only prevents duplicates from the same refresh, but allows vehicles to appear multiple times
    const timeWindow = Math.floor(eventTimestamp.getTime() / (10 * 1000)); // 10-second windows
    const key = `${normalizedPlate}_${timeWindow}`;
    
    if (seenEvents.has(key)) {
      // Keep the most recent one within the same 10-second window
      // This prevents duplicates from the same refresh, but allows later arrivals
      const existing = seenEvents.get(key);
      if (eventTimestamp > new Date(existing.timestamp)) {
        seenEvents.set(key, e);
        return true;
      }
      return false;
    }
    
    seenEvents.set(key, e);
    return true;
  });
  
  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(e => 
      e.plate.toLowerCase().includes(searchLower)
    );
  }
  
  // Apply status filter
  if (filters.status) {
    filtered = filtered.filter(e => e.status === filters.status);
  }
  
  // Apply weather filter
  if (filters.weather) {
    filtered = filtered.filter(e => e.weather === filters.weather);
  }
  
  // Apply make filter
  if (filters.make) {
    const makeLower = filters.make.toLowerCase();
    filtered = filtered.filter(e => 
      e.make.toLowerCase().includes(makeLower)
    );
  }
  
  // Apply model filter
  if (filters.model) {
    const modelLower = filters.model.toLowerCase();
    filtered = filtered.filter(e => 
      e.model.toLowerCase().includes(modelLower)
    );
  }
  
  // Sort by timestamp (newest first)
  filtered.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
  
  return filtered;
}

/**
 * Add a new vehicle event
 * Prevents duplicate events for both temporary and permanent vehicles
 */
export function addVehicleEvent(eventData) {
  const normalizedPlate = eventData.plate.toUpperCase().trim();
  const eventTimestamp = eventData.timestamp ? new Date(eventData.timestamp) : new Date();
  
  // Check for duplicate temporary vehicle events (same plate + entryTime + expiry)
  if (eventData.temporaryAccess && eventData.entryTime && eventData.expiry) {
    const entryTime = new Date(eventData.entryTime).toISOString();
    const expiry = new Date(eventData.expiry).toISOString();
    
    // Check if an event already exists for this temporary vehicle
    const existingEvent = vehicleEvents.find(e => {
      if (e.temporaryAccess && e.entryTime && e.expiry) {
        const existingPlate = e.plate.toUpperCase().trim();
        const existingEntryTime = new Date(e.entryTime).toISOString();
        const existingExpiry = new Date(e.expiry).toISOString();
        
        return existingPlate === normalizedPlate &&
               existingEntryTime === entryTime &&
               existingExpiry === expiry;
      }
      return false;
    });
    
    // If duplicate found, return the existing event instead of creating a new one
    if (existingEvent) {
      return existingEvent;
    }
  }
  
  // Check for duplicate permanent vehicle events (same plate within 10 seconds only)
  // This prevents duplicates from the same refresh/request, but allows vehicles to appear again when they actually arrive later
  if (!eventData.temporaryAccess) {
    const tenSecondsAgo = new Date(eventTimestamp.getTime() - 10 * 1000);
    const tenSecondsLater = new Date(eventTimestamp.getTime() + 10 * 1000);
    
    const existingEvent = vehicleEvents.find(e => {
      if (!e.temporaryAccess) {
        const existingPlate = e.plate.toUpperCase().trim();
        const existingTimestamp = new Date(e.timestamp);
        
        // Only prevent duplicates within 10 seconds (same refresh/request)
        // This allows permanent vehicles to appear multiple times when they actually arrive
        return existingPlate === normalizedPlate &&
               existingTimestamp >= tenSecondsAgo &&
               existingTimestamp <= tenSecondsLater;
      }
      return false;
    });
    
    // If duplicate found within 10 seconds, return the existing event
    // This prevents the same refresh from creating duplicates, but allows later arrivals
    if (existingEvent) {
      return existingEvent;
    }
  }
  
  const newEvent = {
    id: nextEventId++,
    plate: eventData.plate,
    make: eventData.make,
    model: eventData.model,
    confidence: eventData.confidence || (Math.random() * 0.16 + 0.82),
    weather: eventData.weather || 'Sunny',
    timestamp: eventTimestamp,
    image: eventData.image || `/samples/vehicle_${Math.floor(Math.random() * 100) + 1}.jpg`,
    status: eventData.status,
    temporaryAccess: eventData.temporaryAccess || false, // Flag for temporary access
    entryTime: eventData.entryTime || null, // Entry time for temporary vehicles
    expiry: eventData.expiry || null, // Expiry date for temporary vehicles
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  vehicleEvents.unshift(newEvent); // Add to beginning
  return newEvent;
}

/**
 * Get all manual overrides
 */
export function getManualOverrides() {
  return [...manualOverrides];
}

/**
 * Add a new manual override
 */
export function addManualOverride(overrideData) {
  const newOverride = {
    id: nextOverrideId++,
    vehicle: {
      plate: overrideData.vehicle.plate,
      make: overrideData.vehicle.make || '',
      model: overrideData.vehicle.model || ''
    },
    action: overrideData.action,
    timestamp: new Date(),
    createdAt: new Date(),
    updatedAt: new Date()
  };
  
  manualOverrides.unshift(newOverride);
  return newOverride;
}

/**
 * Get all vehicles (with optional filters)
 * Automatically filters out expired temporary visitors
 * NOTE: Returns ALL vehicles regardless of who added them (admin or user)
 * This ensures user-added temporary vehicles are visible to admins in:
 * - Manual Override page (Access Permissions list)
 * - Live Feed (when vehicle arrives)
 * - Vehicle Logs (when events are created)
 */
export function getVehicles(filters = {}) {
  const now = new Date();
  let filtered = vehicles.filter(v => {
    // Permanent vehicles (allow/deny) are always included
    if (v.accessType === 'allow' || v.accessType === 'deny') {
      return true;
    }
    
    // Filter out expired temporary visitors (both admin and user-added)
    if (v.accessType === 'temp') {
      if (v.expiry && new Date(v.expiry) < now) {
        return false; // Expired
      }
      // Also filter out if entry time hasn't arrived yet
      if (v.entryTime && new Date(v.entryTime) > now) {
        return false; // Entry time not reached
      }
    }
    return true;
  });

  // Apply search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filtered = filtered.filter(v => 
      v.licensePlate.toLowerCase().includes(searchLower) ||
      (v.ownerName && v.ownerName.toLowerCase().includes(searchLower)) ||
      v.make.toLowerCase().includes(searchLower) ||
      v.model.toLowerCase().includes(searchLower)
    );
  }

  // Apply access type filter
  if (filters.accessType) {
    filtered = filtered.filter(v => v.accessType === filters.accessType);
  }

  // Sort by created date (newest first)
  filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  
  return filtered;
}

/**
 * Add a new vehicle
 * Automatically saves permanent vehicles (allow/deny) to persistent storage
 */
export function addVehicle(vehicleData) {
  const newVehicle = {
    id: nextVehicleId++,
    licensePlate: vehicleData.licensePlate.toUpperCase().trim(),
    make: vehicleData.make,
    model: vehicleData.model,
    ownerName: vehicleData.ownerName || '',
    notes: vehicleData.notes || '',
    accessType: vehicleData.accessType, // 'allow', 'deny', 'temp'
    entryTime: vehicleData.entryTime || null, // Entry time for temporary visitors
    expiry: vehicleData.expiry || null, // Date string or null
    photo: vehicleData.photo || null, // File path
    addedBy: vehicleData.addedBy, // User ID
    role: vehicleData.role, // 'admin' or 'user'
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  vehicles.unshift(newVehicle);
  
  // Save to persistent storage if it's a permanent vehicle (allow/deny)
  if (newVehicle.accessType === 'allow' || newVehicle.accessType === 'deny') {
    saveVehicles();
    console.log(`💾 Saved permanent vehicle ${newVehicle.licensePlate} to storage`);
  }
  
  return newVehicle;
}

/**
 * Get vehicle by ID
 */
export function getVehicleById(id) {
  return vehicles.find(v => v.id === parseInt(id));
}

/**
 * Update vehicle
 * Automatically saves permanent vehicles (allow/deny) to persistent storage
 */
export function updateVehicle(id, updates) {
  const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(id));
  if (vehicleIndex === -1) {
    return null;
  }

  const updatedVehicle = {
    ...vehicles[vehicleIndex],
    ...updates,
    updatedAt: new Date().toISOString()
  };

  vehicles[vehicleIndex] = updatedVehicle;
  
  // Save to persistent storage if it's a permanent vehicle (allow/deny)
  if (updatedVehicle.accessType === 'allow' || updatedVehicle.accessType === 'deny') {
    saveVehicles();
    console.log(`💾 Updated permanent vehicle ${updatedVehicle.licensePlate} in storage`);
  }
  
  return updatedVehicle;
}

/**
 * Delete vehicle
 * Automatically updates persistent storage for permanent vehicles
 */
export function deleteVehicle(id) {
  const vehicleIndex = vehicles.findIndex(v => v.id === parseInt(id));
  if (vehicleIndex === -1) {
    return false;
  }

  const deletedVehicle = vehicles[vehicleIndex];
  vehicles.splice(vehicleIndex, 1);
  
  // Update persistent storage if it was a permanent vehicle (allow/deny)
  if (deletedVehicle.accessType === 'allow' || deletedVehicle.accessType === 'deny') {
    saveVehicles();
    console.log(`💾 Removed permanent vehicle ${deletedVehicle.licensePlate} from storage`);
  }
  
  return true;
}

/**
 * Clean up expired temporary visitors
 * Only removes temporary vehicles, never removes permanent vehicles (allow/deny)
 * Call this periodically or during searches
 */
export function cleanupExpiredVehicles() {
  const now = new Date();
  const beforeCount = vehicles.length;
  
  // Only filter out expired temporary visitors, never permanent vehicles
  vehicles = vehicles.filter(v => {
    // Permanent vehicles (allow/deny) are never removed
    if (v.accessType === 'allow' || v.accessType === 'deny') {
      return true;
    }
    
    // Only remove temporary vehicles that have expired
    if (v.accessType === 'temp' && v.expiry && new Date(v.expiry) < now) {
      return false;
    }
    return true;
  });
  
  const removed = beforeCount - vehicles.length;
  if (removed > 0) {
    console.log(`🧹 Cleaned up ${removed} expired temporary visitor(s)`);
  }
  return removed;
}

export default {
  initializeStorage,
  getVehicleEvents,
  addVehicleEvent,
  getManualOverrides,
  addManualOverride,
  getVehicles,
  addVehicle,
  getVehicleById,
  updateVehicle,
  deleteVehicle,
  cleanupExpiredVehicles
};

