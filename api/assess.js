import Anthropic from '@anthropic-ai/sdk'

const SYSTEM_PROMPT = `You are a senior P&C insurance underwriter with deep expertise in Canadian climate risk. You have been given 10 years of weather data for a specific Canadian location. Produce a structured underwriting risk assessment covering: overall climate risk rating (Low, Moderate, High, or Extreme) with confidence level, top three weather perils for this location with severity rating each, trend analysis — is risk increasing, stable, or decreasing based on the 10 year data, underwriting implications — what should a property underwriter consider when pricing risk in this location, and one specific recommendation. Keep the response under 250 words. Be direct and data driven.`

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type')

  if (req.method === 'OPTIONS') {
    return res.status(200).end()
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const accessCode = (process.env.ACCESS_CODE || '').trim()
  if (accessCode && req.headers['x-access-code'] !== accessCode) {
    return res.status(401).json({ error: 'Invalid access code' })
  }

  const { location, annualData } = req.body

  if (!location || !annualData) {
    return res.status(400).json({ error: 'Missing location or annualData' })
  }

  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY not configured' })
  }

  const client = new Anthropic({ apiKey })

  const avgPrecip = (annualData.reduce((s, d) => s + d.precipitation, 0) / annualData.length).toFixed(0)
  const peakWind = Math.max(...annualData.map(d => d.maxWind)).toFixed(0)
  const avgHeatDays = (annualData.reduce((s, d) => s + d.heatDays, 0) / annualData.length).toFixed(1)
  const avgSnowfall = (annualData.reduce((s, d) => s + d.snowfall, 0) / annualData.length).toFixed(0)
  const avgExtremeWind = (annualData.reduce((s, d) => s + d.extremeWindDays, 0) / annualData.length).toFixed(1)

  const startYear = annualData[0].year
  const endYear = annualData[annualData.length - 1].year

  const userContent = `Location: ${location.name}, ${location.province}
Coordinates: ${location.lat.toFixed(4)}°N, ${Math.abs(location.lng).toFixed(4)}°W

10-Year Historical Weather Data (${startYear}–${endYear}):
${annualData.map(d =>
  `${d.year}: Precipitation ${d.precipitation.toFixed(0)}mm | Max Wind ${d.maxWind.toFixed(0)}km/h | Snowfall ${d.snowfall.toFixed(0)}cm | Heat Days (>30°C) ${d.heatDays} | Strong Wind Days (>40km/h) ${d.extremeWindDays}`
).join('\n')}

Summary Statistics:
- Avg Annual Precipitation: ${avgPrecip}mm
- Peak Wind Speed Recorded: ${peakWind}km/h
- Avg Heat Days/Year (>30°C): ${avgHeatDays}
- Avg Annual Snowfall: ${avgSnowfall}cm
- Avg Strong Wind Days/Year (>40km/h): ${avgExtremeWind}

Please provide the structured underwriting risk assessment.`

  try {
    const message = await client.messages.create({
      model: 'claude-opus-4-7',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      messages: [{ role: 'user', content: userContent }],
    })

    const assessment = message.content[0].text

    // Extract risk rating from the assessment text
    const ratingMatch = assessment.match(/\b(Extreme|High|Moderate|Low)\b/i)
    const rating = ratingMatch
      ? ratingMatch[1].charAt(0).toUpperCase() + ratingMatch[1].slice(1).toLowerCase()
      : 'Moderate'

    // Normalize to exact casing
    const validRatings = ['Low', 'Moderate', 'High', 'Extreme']
    const normalizedRating = validRatings.find(r => r.toLowerCase() === rating.toLowerCase()) || 'Moderate'

    return res.status(200).json({ assessment, rating: normalizedRating })
  } catch (err) {
    console.error('Anthropic API error:', err)
    return res.status(500).json({ error: 'Failed to generate assessment. Please try again.' })
  }
}
