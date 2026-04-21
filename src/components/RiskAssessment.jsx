const RATING_CONFIG = {
  Low: { color: '#22c55e', bg: 'rgba(34, 197, 94, 0.1)', border: 'rgba(34, 197, 94, 0.3)', label: 'LOW RISK' },
  Moderate: { color: '#f59e0b', bg: 'rgba(245, 158, 11, 0.1)', border: 'rgba(245, 158, 11, 0.3)', label: 'MODERATE RISK' },
  High: { color: '#f97316', bg: 'rgba(249, 115, 22, 0.1)', border: 'rgba(249, 115, 22, 0.3)', label: 'HIGH RISK' },
  Extreme: { color: '#ef4444', bg: 'rgba(239, 68, 68, 0.1)', border: 'rgba(239, 68, 68, 0.3)', label: 'EXTREME RISK' },
}

function RatingBadge({ rating }) {
  const config = RATING_CONFIG[rating] || RATING_CONFIG.Moderate
  return (
    <div
      className="rating-badge"
      style={{
        color: config.color,
        backgroundColor: config.bg,
        borderColor: config.border,
      }}
    >
      <span className="rating-dot" style={{ backgroundColor: config.color }} />
      {config.label}
    </div>
  )
}

function formatAssessment(text) {
  // Split into paragraphs and render with basic formatting
  const lines = text.split('\n').filter(l => l.trim())
  return lines.map((line, i) => {
    const trimmed = line.trim()
    // Detect section headers (lines ending with colon or starting with numbered points)
    if (/^#+\s/.test(trimmed)) {
      return <h4 key={i} className="assessment-heading">{trimmed.replace(/^#+\s/, '')}</h4>
    }
    if (/^\*\*(.+)\*\*/.test(trimmed)) {
      const withBold = trimmed.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
      return <p key={i} className="assessment-para" dangerouslySetInnerHTML={{ __html: withBold }} />
    }
    if (/^[-•]\s/.test(trimmed)) {
      return <li key={i} className="assessment-item">{trimmed.replace(/^[-•]\s/, '')}</li>
    }
    if (/^\d+\.\s/.test(trimmed)) {
      return <li key={i} className="assessment-item">{trimmed.replace(/^\d+\.\s/, '')}</li>
    }
    return <p key={i} className="assessment-para">{trimmed}</p>
  })
}

export default function RiskAssessment({ assessment, rating, loading }) {
  const config = RATING_CONFIG[rating] || RATING_CONFIG.Moderate

  return (
    <div className="assessment-panel" style={{ borderColor: config.border }}>
      <div className="assessment-header">
        <div className="assessment-title-row">
          <div className="assessment-title-group">
            <svg className="assessment-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10 9 9 9 8 9" />
            </svg>
            <div>
              <h3 className="assessment-title">AI Underwriting Assessment</h3>
              <p className="assessment-powered">Powered by Claude AI · claude-opus-4-7</p>
            </div>
          </div>
          {rating && <RatingBadge rating={rating} />}
        </div>
      </div>

      <div className="assessment-body">
        {loading ? (
          <div className="assessment-loading">
            <div className="loading-pulse">
              <div className="loading-line" style={{ width: '90%' }} />
              <div className="loading-line" style={{ width: '75%' }} />
              <div className="loading-line" style={{ width: '85%' }} />
              <div className="loading-line" style={{ width: '60%' }} />
              <div className="loading-line" style={{ width: '80%' }} />
              <div className="loading-line" style={{ width: '70%' }} />
            </div>
            <p className="loading-caption">Generating risk assessment...</p>
          </div>
        ) : (
          <div className="assessment-content">
            {formatAssessment(assessment)}
          </div>
        )}
      </div>

      <div className="assessment-footer">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="14" height="14">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        For professional underwriting decisions only. Verify with licensed actuarial analysis.
      </div>
    </div>
  )
}
