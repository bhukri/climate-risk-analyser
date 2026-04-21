export default function LocationHeader({ location }) {
  return (
    <div className="location-header">
      <div className="location-icon">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
          <circle cx="12" cy="10" r="3" />
        </svg>
      </div>
      <div className="location-info">
        <h2 className="location-name">{location.name}</h2>
        <p className="location-meta">
          {location.province}, {location.country}
          <span className="location-coords">
            {location.lat.toFixed(4)}°N &nbsp;{Math.abs(location.lng).toFixed(4)}°W
          </span>
        </p>
      </div>
    </div>
  )
}
