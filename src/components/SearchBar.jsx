import { useState } from 'react'

export default function SearchBar({ onSearch, loading }) {
  const [query, setQuery] = useState('')

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = query.trim()
    if (trimmed) onSearch(trimmed)
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit}>
      <div className="search-input-wrapper">
        <svg className="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="11" cy="11" r="8" />
          <line x1="21" y1="21" x2="16.65" y2="16.65" />
        </svg>
        <input
          type="text"
          className="search-input"
          placeholder="Enter a Canadian city or postal code..."
          value={query}
          onChange={e => setQuery(e.target.value)}
          disabled={loading}
        />
      </div>
      <button type="submit" className="search-btn" disabled={loading || !query.trim()}>
        {loading ? (
          <span className="btn-loading">
            <span className="spinner" />
            Analysing...
          </span>
        ) : (
          'Analyse Risk'
        )}
      </button>
    </form>
  )
}
