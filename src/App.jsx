import { useState, useEffect, useCallback } from 'react'
import SearchBar from './components/SearchBar.jsx'
import LocationHeader from './components/LocationHeader.jsx'
import ClimateCards from './components/ClimateCards.jsx'
import TrendCharts from './components/TrendCharts.jsx'
import RiskAssessment from './components/RiskAssessment.jsx'
import { geocodeLocation } from './services/geocoding.js'
import { fetchHistoricalWeather } from './services/weather.js'

const DEFAULT_CITY = 'Toronto'

const LOADING_STEPS = [
  { key: 'geocoding', message: 'Locating city...' },
  { key: 'weather', message: 'Fetching 10 years of climate data...' },
  { key: 'ai', message: 'Generating AI risk assessment...' },
]

function AccessGate({ onUnlock, gateError }) {
  const [input, setInput] = useState('')
  const [localError, setLocalError] = useState(false)
  const showError = gateError || localError

  const submit = (e) => {
    e.preventDefault()
    const code = input.trim()
    if (!code) { setLocalError(true); return }
    sessionStorage.setItem('access_code', code)
    onUnlock(code)
  }

  return (
    <div className="gate-overlay">
      <div className="gate-card">
        <div className="brand-icon" style={{ margin: '0 auto 1.25rem' }}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
            <polyline points="9 22 9 12 15 12 15 22" />
          </svg>
        </div>
        <h2 className="gate-title">Canadian Climate Risk Analyser</h2>
        <p className="gate-subtitle">Enter your access code to continue</p>
        <form onSubmit={submit} className="gate-form">
          <input
            type="password"
            className={`gate-input${showError ? ' gate-input--error' : ''}`}
            placeholder="Access code"
            value={input}
            onChange={e => { setInput(e.target.value); setLocalError(false) }}
            autoFocus
          />
          {showError && <p className="gate-error">Incorrect access code — try again</p>}
          <button type="submit" className="gate-btn">Unlock</button>
        </form>
      </div>
    </div>
  )
}

export default function App() {
  const [accessCode, setAccessCode] = useState(() => sessionStorage.getItem('access_code') || '')
  const [gateError, setGateError] = useState(false)
  const [location, setLocation] = useState(null)
  const [annualData, setAnnualData] = useState(null)
  const [assessment, setAssessment] = useState('')
  const [rating, setRating] = useState(null)
  const [loadingStep, setLoadingStep] = useState(null)
  const [error, setError] = useState(null)
  const [aiLoading, setAiLoading] = useState(false)

  const analyse = useCallback(async (query, code = accessCode) => {
    setError(null)
    setAssessment('')
    setRating(null)

    try {
      // Step 1: Geocode
      setLoadingStep('geocoding')
      const loc = await geocodeLocation(query)
      setLocation(loc)

      // Step 2: Weather data
      setLoadingStep('weather')
      const data = await fetchHistoricalWeather(loc.lat, loc.lng)
      setAnnualData(data)
      setLoadingStep(null)

      // Step 3: AI assessment
      setAiLoading(true)
      const apiBase = import.meta.env.DEV ? 'http://localhost:3001' : ''
      const res = await fetch(`${apiBase}/api/assess`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'x-access-code': code },
        body: JSON.stringify({ location: loc, annualData: data }),
      })

      if (res.status === 401) {
        sessionStorage.removeItem('access_code')
        setAccessCode('')
        setGateError(true)
        return
      }

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: 'API error' }))
        throw new Error(err.error || 'Failed to generate assessment')
      }

      const result = await res.json()
      setAssessment(result.assessment)
      setRating(result.rating)
    } catch (err) {
      setError(err.message || 'An unexpected error occurred')
      setLoadingStep(null)
    } finally {
      setAiLoading(false)
      setLoadingStep(null)
    }
  }, [accessCode])

  const handleUnlock = useCallback((code) => {
    setAccessCode(code)
    setGateError(false)
    analyse(DEFAULT_CITY, code)
  }, [analyse])

  useEffect(() => {
    if (accessCode) analyse(DEFAULT_CITY)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const isLoading = loadingStep !== null
  const currentStep = LOADING_STEPS.find(s => s.key === loadingStep)

  if (!accessCode) {
    return <AccessGate onUnlock={handleUnlock} gateError={gateError} />
  }

  return (
    <div className="app">
      {/* Header */}
      <header className="app-header">
        <div className="header-inner">
          <div className="header-brand">
            <div className="brand-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            </div>
            <div>
              <h1 className="brand-title">Canadian Climate Risk Analyser</h1>
              <p className="brand-subtitle">P&amp;C Underwriting Intelligence Platform</p>
            </div>
          </div>
          <div className="header-meta">
            <span className="header-badge">
              <span className="badge-dot" />
              Live Data
            </span>
          </div>
        </div>
      </header>

      {/* Search */}
      <div className="search-section">
        <div className="container">
          <SearchBar onSearch={analyse} loading={isLoading || aiLoading} />
          {isLoading && currentStep && (
            <div className="loading-status">
              <div className="loading-spinner" />
              <span>{currentStep.message}</span>
            </div>
          )}
          {error && (
            <div className="error-banner">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
              {error}
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      <main className="container main-content">
        {location && annualData ? (
          <>
            <LocationHeader location={location} />
            <ClimateCards annualData={annualData} />
            <TrendCharts annualData={annualData} />
            {(assessment || aiLoading) && (
              <RiskAssessment
                assessment={assessment}
                rating={rating}
                loading={aiLoading}
              />
            )}
          </>
        ) : !isLoading && !error ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="48" height="48">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <p>Search for any Canadian city to begin risk analysis</p>
          </div>
        ) : null}
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <div className="container footer-inner">
          <span>Data: Open-Meteo Historical API · AI: Anthropic Claude</span>
          <span>For professional use only · Not actuarial advice</span>
        </div>
      </footer>
    </div>
  )
}
