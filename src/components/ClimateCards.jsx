function StatCard({ icon, label, value, unit, sub }) {
  return (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-body">
        <p className="stat-label">{label}</p>
        <p className="stat-value">
          {value}
          <span className="stat-unit">{unit}</span>
        </p>
        {sub && <p className="stat-sub">{sub}</p>}
      </div>
    </div>
  )
}

export default function ClimateCards({ annualData }) {
  const avg = (arr) => arr.reduce((a, b) => a + b, 0) / arr.length

  const avgPrecip = avg(annualData.map(d => d.precipitation))
  const peakWind = Math.max(...annualData.map(d => d.maxWind))
  const avgHeatDays = avg(annualData.map(d => d.heatDays))
  const avgSnowfall = avg(annualData.map(d => d.snowfall))

  const startYear = annualData[0].year
  const endYear = annualData[annualData.length - 1].year
  const span = `${startYear}–${endYear}`

  return (
    <div className="cards-grid">
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="12" y1="2" x2="12" y2="6" />
            <path d="M5.2 11.2A7 7 0 1 0 18.8 11.2" />
            <path d="M12 6a5 5 0 0 1 5 5c0 2-1 3.5-2.5 4.5V18a2.5 2.5 0 0 1-5 0v-2.5C8 14.5 7 13 7 11a5 5 0 0 1 5-5z" />
          </svg>
        }
        label="Avg Annual Precipitation"
        value={avgPrecip.toFixed(0)}
        unit=" mm"
        sub={`10-yr average (${span})`}
      />
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9.59 4.59A2 2 0 1 1 11 8H2m10.59 11.41A2 2 0 1 0 14 16H2m15.73-8.27A2.5 2.5 0 1 1 19.5 12H2" />
          </svg>
        }
        label="Peak Wind Speed"
        value={peakWind.toFixed(0)}
        unit=" km/h"
        sub={`10-yr maximum (${span})`}
      />
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="5" />
            <line x1="12" y1="1" x2="12" y2="3" />
            <line x1="12" y1="21" x2="12" y2="23" />
            <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
            <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
            <line x1="1" y1="12" x2="3" y2="12" />
            <line x1="21" y1="12" x2="23" y2="12" />
            <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
            <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
          </svg>
        }
        label="Extreme Heat Days"
        value={avgHeatDays.toFixed(1)}
        unit=" days/yr"
        sub="Days above 30°C, 10-yr avg"
      />
      <StatCard
        icon={
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20 17.58A5 5 0 0 0 18 8h-1.26A8 8 0 1 0 4 16.25" />
            <line x1="8" y1="16" x2="8.01" y2="16" />
            <line x1="8" y1="20" x2="8.01" y2="20" />
            <line x1="12" y1="18" x2="12.01" y2="18" />
            <line x1="12" y1="22" x2="12.01" y2="22" />
            <line x1="16" y1="16" x2="16.01" y2="16" />
            <line x1="16" y1="20" x2="16.01" y2="20" />
          </svg>
        }
        label="Avg Annual Snowfall"
        value={avgSnowfall.toFixed(0)}
        unit=" cm"
        sub={`10-yr average (${span})`}
      />
    </div>
  )
}
