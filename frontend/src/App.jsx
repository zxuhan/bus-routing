import React, { useState } from 'react'
import SearchForm from './components/SearchForm.jsx'
import Directions from './components/Directions.jsx'
import MapView from './components/MapView.jsx'
import { fetchRoute } from './api/route.js'

export default function App() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [result, setResult] = useState(undefined) // undefined = initial, null = no route found
  const [points, setPoints] = useState(null)

  async function handleSearch(from, to, time) {
    setLoading(true)
    setError(null)
    setResult(undefined)
    setPoints(null)

    try {
      const data = await fetchRoute(from, to, time)
      if (data === null) {
        // HTTP 204 — no route found
        setResult(null)
        setPoints(null)
      } else {
        setResult(data)
        setPoints(data.points || [])
      }
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.app}>
      {/* Left Panel */}
      <aside style={styles.leftPanel}>
        <SearchForm onSearch={handleSearch} loading={loading} />
        <Directions
          items={result?.directions}
          noRoute={result === null}
          error={error}
        />
      </aside>

      {/* Right Panel — Map */}
      <main style={styles.rightPanel}>
        <MapView points={points} />
      </main>
    </div>
  )
}

const styles = {
  app: {
    display: 'flex',
    height: '100vh',
    overflow: 'hidden',
    background: 'var(--color-bg)',
  },
  leftPanel: {
    width: 360,
    flexShrink: 0,
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    background: 'var(--color-card)',
    boxShadow: '2px 0 12px rgba(0,0,0,0.06)',
    zIndex: 10,
    overflow: 'hidden',
  },
  rightPanel: {
    flex: 1,
    height: '100vh',
    overflow: 'hidden',
  },
}
