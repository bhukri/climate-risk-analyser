export async function fetchHistoricalWeather(lat, lng) {
  const currentYear = new Date().getFullYear()
  const endYear = currentYear - 1
  const startYear = endYear - 9

  const params = new URLSearchParams({
    latitude: lat.toString(),
    longitude: lng.toString(),
    start_date: `${startYear}-01-01`,
    end_date: `${endYear}-12-31`,
    daily: 'temperature_2m_max,precipitation_sum,wind_speed_10m_max,snowfall_sum',
    timezone: 'auto',
  })

  const response = await fetch(`https://archive-api.open-meteo.com/v1/archive?${params}`)
  if (!response.ok) throw new Error('Failed to fetch historical weather data')

  const data = await response.json()
  if (!data.daily) throw new Error('No weather data returned for this location')

  return processWeatherData(data, startYear, endYear)
}

function processWeatherData(data, startYear, endYear) {
  const { time, temperature_2m_max, precipitation_sum, wind_speed_10m_max, snowfall_sum } = data.daily

  const annualData = {}
  for (let year = startYear; year <= endYear; year++) {
    annualData[year] = {
      year,
      precipitation: 0,
      maxWind: 0,
      snowfall: 0,
      heatDays: 0,
      extremeWindDays: 0,
    }
  }

  time.forEach((dateStr, i) => {
    const year = parseInt(dateStr.split('-')[0], 10)
    if (!annualData[year]) return

    const precip = precipitation_sum[i] ?? 0
    const wind = wind_speed_10m_max[i] ?? 0
    const snow = snowfall_sum[i] ?? 0
    const temp = temperature_2m_max[i]

    annualData[year].precipitation += precip
    annualData[year].snowfall += snow
    annualData[year].maxWind = Math.max(annualData[year].maxWind, wind)

    if (temp !== null && temp !== undefined && temp > 30) {
      annualData[year].heatDays++
    }
    if (wind > 60) {
      annualData[year].extremeWindDays++
    }
  })

  return Object.values(annualData).sort((a, b) => a.year - b.year)
}
