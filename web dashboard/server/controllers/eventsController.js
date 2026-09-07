import { getVehicleEvents, addVehicleEvent } from '../utils/storage.js';

/**
 * GET /api/events
 * Return historical vehicle logs with pagination, search, and filters
 */
export async function getEvents(req, res) {
  try {
    const {
      page = 1,
      limit = 20,
      search = '',
      status,
      weather,
      make,
      model
    } = req.query;
    
    // Build filters
    const filters = {};
    if (search) filters.search = search;
    if (status) filters.status = status;
    if (weather) filters.weather = weather;
    if (make) filters.make = make;
    if (model) filters.model = model;
    
    // Get filtered events
    const allEvents = getVehicleEvents(filters);
    
    // Events are returned as-is without guest/personal vehicle enrichment
    const enrichedEvents = allEvents;
    
    const total = enrichedEvents.length;
    
    // Apply pagination
    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;
    const events = enrichedEvents.slice(skip, skip + limitNum);
    
    res.json({
      events,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    });
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
}

/**
 * POST /api/events
 * Add new vehicle event (manual or simulation)
 */
export async function createEvent(req, res) {
  try {
    let {
      plate,
      make,
      model,
      confidence,
      weather,
      timestamp,
      image,
      status,
      temporaryAccess,
      entryTime,
      expiry
    } = req.body;
    
    // Validate required fields
    if (!plate || !make || !model) {
      return res.status(400).json({ error: 'Missing required fields' });
    }
    
    // Auto-determine status if not provided
    if (!status) {
      status = 'Denied';
    }
    
    // Create event
    const event = addVehicleEvent({
      plate,
      make,
      model,
      confidence: confidence || 0.85,
      weather: weather || 'Sunny',
      timestamp: timestamp || new Date().toISOString(),
      image: image || `/samples/vehicle_${Math.floor(Math.random() * 100) + 1}.jpg`,
      status,
      temporaryAccess: temporaryAccess || false,
      entryTime: entryTime || null, // Store entry time for temporary vehicles
      expiry: expiry || null // Store expiry for temporary vehicles
    });
    
    res.status(201).json(event);
  } catch (error) {
    console.error('Error creating event:', error);
    res.status(500).json({ error: 'Failed to create event' });
  }
}

