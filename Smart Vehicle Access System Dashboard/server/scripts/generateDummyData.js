import { generateDummyEvents } from '../utils/dummyData.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const events = generateDummyEvents(100);
const outputPath = path.join(__dirname, '..', 'data', 'dummyEvents.json');

// Format timestamps as ISO strings for JSON
const formattedEvents = events.map(event => ({
  ...event,
  timestamp: event.timestamp.toISOString()
}));

fs.writeFileSync(outputPath, JSON.stringify(formattedEvents, null, 2));
console.log(`✅ Generated ${formattedEvents.length} dummy events in ${outputPath}`);

