export async function geocodeLocation(query) {
  const params = new URLSearchParams({
    name: query,
    count: '10',
    language: 'en',
    format: 'json',
  })

  const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?${params}`)
  if (!response.ok) throw new Error('Geocoding service unavailable')

  const data = await response.json()

  if (!data.results || data.results.length === 0) {
    throw new Error(`Location "${query}" not found. Please try a city name or postal code.`)
  }

  const canadianResults = data.results.filter(r => r.country_code === 'CA')
  if (canadianResults.length === 0) {
    throw new Error(`No Canadian location found for "${query}". This tool covers Canadian locations only.`)
  }

  const result = canadianResults[0]
  return {
    name: result.name,
    province: result.admin1 || '',
    country: result.country,
    lat: result.latitude,
    lng: result.longitude,
    timezone: result.timezone || 'America/Toronto',
  }
}
