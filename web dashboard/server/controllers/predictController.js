import { generateDummyEvent } from '../utils/dummyData.js';
import { removeGlare } from '../utils/imageProcessor.js';
import { getVehicles } from '../utils/storage.js';

/**
 * POST /api/predict
 * Returns dummy prediction with glare removal applied
 * Checks for vehicle access rules (permanent allow/deny, temporary visitors)
 */
export async function predictVehicle(req, res) {
  try {
    // Check for vehicle access rules first
    // NOTE: getVehicles() returns ALL vehicles (admin and user-added)
    // This ensures user-added temporary vehicles can appear in Live Feed
    const vehicles = getVehicles();
    const now = new Date();
    
    // Filter active temporary visitors (entry time passed and not expired)
    // Includes both admin and user-added temporary vehicles
    const activeTemporaryVehicles = vehicles.filter(v => {
      if (v.accessType === 'temp') {
        const entryTime = v.entryTime ? new Date(v.entryTime) : null;
        const expiry = v.expiry ? new Date(v.expiry) : null;
        const entryTimePassed = !entryTime || entryTime <= now;
        const notExpired = expiry && expiry > now;
        return entryTimePassed && notExpired;
      }
      return false;
    });
    
    // Filter permanent allow/deny vehicles
    const permanentVehicles = vehicles.filter(v => 
      v.accessType === 'allow' || v.accessType === 'deny'
    );
    
    // 30% chance to simulate a registered vehicle arriving (if any exist)
    // This includes user-added temporary vehicles, so they can appear in Live Feed
    const shouldUseRegisteredVehicle = (activeTemporaryVehicles.length > 0 || permanentVehicles.length > 0) && Math.random() < 0.3;
    
    let plate, make, model, confidence, weather, processedImage;
    let status = 'Denied';
    let temporaryAccess = false;
    let matchingVehicle = null;
    let predictionEntryTime = null;
    let predictionExpiry = null;
    
    if (shouldUseRegisteredVehicle) {
      // Randomly select a registered vehicle to simulate arrival
      const allRegisteredVehicles = [...activeTemporaryVehicles, ...permanentVehicles];
      if (allRegisteredVehicles.length > 0) {
        matchingVehicle = allRegisteredVehicles[Math.floor(Math.random() * allRegisteredVehicles.length)];
        plate = matchingVehicle.licensePlate;
        make = matchingVehicle.make;
        model = matchingVehicle.model;
        
        // Generate dummy data for confidence and weather
        const dummyEvent = generateDummyEvent(Math.floor(Math.random() * 100));
        confidence = dummyEvent.confidence;
        weather = dummyEvent.weather;
        
        // Use vehicle's photo if available, otherwise use dummy image
        const vehicleImage = matchingVehicle.photo || dummyEvent.image;
        processedImage = await removeGlare(vehicleImage);
      } else {
        // Fallback to random
        const dummyEvent = generateDummyEvent(Math.floor(Math.random() * 100));
        plate = dummyEvent.plate;
        make = dummyEvent.make;
        model = dummyEvent.model;
        confidence = dummyEvent.confidence;
        weather = dummyEvent.weather;
        processedImage = await removeGlare(dummyEvent.image);
      }
    } else {
      // Generate random dummy prediction
      const dummyEvent = generateDummyEvent(Math.floor(Math.random() * 100));
      plate = dummyEvent.plate;
      make = dummyEvent.make;
      model = dummyEvent.model;
      confidence = dummyEvent.confidence;
      weather = dummyEvent.weather;
      processedImage = await removeGlare(dummyEvent.image);
    }
    
    // If we have a matching vehicle, determine status based on access type
    if (matchingVehicle) {
      if (matchingVehicle.accessType === 'allow') {
        // Permanent allow
        status = 'Allowed';
      } else if (matchingVehicle.accessType === 'deny') {
        // Permanent deny
        status = 'Denied';
      } else if (matchingVehicle.accessType === 'temp') {
        // Temporary visitor - check entry time and expiry
        const entryTime = matchingVehicle.entryTime ? new Date(matchingVehicle.entryTime) : null;
        const expiry = matchingVehicle.expiry ? new Date(matchingVehicle.expiry) : null;
        
        // Check if entry time has arrived and not expired
        const entryTimePassed = !entryTime || entryTime <= now;
        const notExpired = expiry && expiry > now;
        
        if (entryTimePassed && notExpired) {
          status = 'Allowed';
          temporaryAccess = true;
          // Store entry time and expiry in prediction so they can be saved with the event
          if (entryTime) predictionEntryTime = entryTime.toISOString();
          if (expiry) predictionExpiry = expiry.toISOString();
        } else if (!entryTimePassed) {
          // Entry time not reached yet
          status = 'Denied';
        } else {
          // Expired temporary visitor
          status = 'Denied';
        }
      }
    } else {
      // Check if the generated plate matches any vehicle
      const normalizedPlate = plate.toUpperCase().trim();
      const foundVehicle = vehicles.find(v => 
        v.licensePlate.toUpperCase() === normalizedPlate
      );
      
      if (foundVehicle) {
        if (foundVehicle.accessType === 'allow') {
          status = 'Allowed';
        } else if (foundVehicle.accessType === 'deny') {
          status = 'Denied';
        } else if (foundVehicle.accessType === 'temp') {
          const entryTime = foundVehicle.entryTime ? new Date(foundVehicle.entryTime) : null;
          const expiry = foundVehicle.expiry ? new Date(foundVehicle.expiry) : null;
          
          const entryTimePassed = !entryTime || entryTime <= now;
          const notExpired = expiry && expiry > now;
          
          if (entryTimePassed && notExpired) {
            status = 'Allowed';
            temporaryAccess = true;
            if (entryTime) predictionEntryTime = entryTime.toISOString();
            if (expiry) predictionExpiry = expiry.toISOString();
          } else {
            status = 'Denied';
          }
        }
      } else {
        // No matching vehicle rule - use AI model decision logic
        // Higher confidence + certain weather conditions = more likely to be allowed
        if (confidence > 0.90) {
          status = 'Allowed';
        } else if (confidence > 0.85 && (weather === 'Sunny' || weather === 'Cloudy')) {
          status = 'Allowed';
        } else if (confidence > 0.88) {
          status = 'Allowed';
        }
        
        // Override with random for variety
        if (Math.random() > 0.4) {
          status = 'Allowed';
        }
      }
    }
    
    const prediction = {
      plate: plate,
      make: make,
      model: model,
      confidence: confidence,
      weather: weather,
      timestamp: new Date().toISOString(),
      image: processedImage, // Image path after glare removal
      status: status,
      temporaryAccess: temporaryAccess, // Flag for temporary access
      entryTime: predictionEntryTime, // Entry time for temporary vehicles
      expiry: predictionExpiry, // Expiry date for temporary vehicles
    };
    
    res.json(prediction);
  } catch (error) {
    console.error('Error in predict:', error);
    res.status(500).json({ error: 'Failed to generate prediction' });
  }
}

