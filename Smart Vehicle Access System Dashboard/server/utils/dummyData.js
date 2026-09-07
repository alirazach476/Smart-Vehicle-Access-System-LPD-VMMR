/**
 * Generate dummy vehicle data
 */

const makes = ['Toyota', 'Honda', 'Suzuki', 'KIA', 'Hyundai', 'Ford', 'Nissan', 'Mazda', 'BMW', 'Mercedes', 'Audi', 'Volkswagen', 'Chevrolet', 'Volvo', 'Lexus'];
const models = ['Corolla', 'Civic', 'Swift', 'Sportage', 'Elantra', 'Focus', 'Altima', 'CX-5', '3 Series', 'C-Class', 'A4', 'Golf', 'Cruze', 'XC60', 'ES350', 'Camry', 'Accord', 'Vitara', 'Sorento', 'Sonata', 'F-150', 'Sentra', 'CX-9', '5 Series', 'E-Class'];
const weatherConditions = ['Fog', 'Rain', 'Cloudy', 'Sunny', 'Mist', 'Haze'];
const statuses = ['Allowed', 'Denied'];

/**
 * Generate a single dummy vehicle event
 */
export function generateDummyEvent(index) {
  const plateNumber = `LEA-${1001 + index}`;
  const make = makes[Math.floor(Math.random() * makes.length)];
  const model = models[Math.floor(Math.random() * models.length)];
  const confidence = (Math.random() * 0.16 + 0.82).toFixed(2); // 0.82 to 0.98
  const weather = weatherConditions[Math.floor(Math.random() * weatherConditions.length)];
  const status = statuses[Math.floor(Math.random() * statuses.length)];
  
  // Generate timestamp within last 30 days
  const now = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  const hoursAgo = Math.floor(Math.random() * 24);
  const minutesAgo = Math.floor(Math.random() * 60);
  const timestamp = new Date(now.getTime() - (daysAgo * 24 * 60 * 60 * 1000) - (hoursAgo * 60 * 60 * 1000) - (minutesAgo * 60 * 1000));
  
  const imageNumber = (index % 100) + 1; // Cycle through 1-100
  
  return {
    plate: plateNumber,
    make,
    model,
    confidence: parseFloat(confidence),
    weather,
    timestamp,
    image: `/samples/vehicle_${imageNumber}.jpg`,
    status
  };
}

/**
 * Generate array of dummy events
 */
export function generateDummyEvents(count = 100) {
  return Array.from({ length: count }, (_, i) => generateDummyEvent(i));
}

