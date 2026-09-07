import {
  getAllUsers,
} from './userDatabase.js';

/**
 * Check if a plate number should be automatically allowed
 * Returns object with access info
 * Note: Guest and personal vehicle functionality has been removed
 */
export function checkPlateAccess(plateNumber) {
  if (!plateNumber) {
    return {
      allowed: false,
      reason: 'no_plate',
      type: 'unknown',
    };
  }
  
  // All vehicles are now checked by the AI model only
  // No automatic access based on registration
  return {
    allowed: false,
    reason: 'not_registered',
    type: 'unknown',
  };
}
