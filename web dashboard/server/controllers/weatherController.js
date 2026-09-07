/**
 * GET /api/weather
 * Return dummy weather JSON
 */
export async function getWeather(req, res) {
  try {
    const conditions = ['Fog', 'Rain', 'Cloudy', 'Sunny', 'Mist', 'Haze', 'Smog', 'Snow'];
    const visibilities = ['Low', 'Medium', 'High'];
    
    const condition = conditions[Math.floor(Math.random() * conditions.length)];
    
    // Map condition to visibility
    let visibility = 'High';
    if (condition === 'Fog' || condition === 'Mist' || condition === 'Haze' || condition === 'Smog') {
      visibility = 'Low';
    } else if (condition === 'Rain' || condition === 'Cloudy' || condition === 'Snow') {
      visibility = 'Medium';
    }
    
    const weather = {
      condition,
      visibility,
      temp: Math.floor(Math.random() * 20) + 5 // 5-25°C
    };
    
    res.json(weather);
  } catch (error) {
    console.error('Error fetching weather:', error);
    res.status(500).json({ error: 'Failed to fetch weather' });
  }
}

