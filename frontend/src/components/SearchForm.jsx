import React, { useState, useRef, useEffect } from 'react'
import { ZIPCODES } from '../data/zipcodes.js'

/* ── Time options: 48 slots, 12-hour format ── */
const TIME_OPTIONS = Array.from({ length: 48 }, (_, i) => {
  const h = Math.floor(i / 2)
  const m = i % 2 === 0 ? '00' : '30'
  const value = `${String(h).padStart(2, '0')}:${m}`
  const period = h < 12 ? 'AM' : 'PM'
  const hour = h === 0 ? 12 : h > 12 ? h - 12 : h
  const label = `${hour}:${m} ${period}`
  return { value, label }
})

const nowTime = () => {
  const d = new Date()
  const h = d.getHours()
  const m = d.getMinutes() < 30 ? '00' : '30'
  return `${String(h).padStart(2, '0')}:${m}`
}

/* ── ZipAutocomplete sub-component ── */
function ZipAutocomplete({ id, value, onChange, placeholder, accentColor }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(value)
  const wrapRef = useRef(null)

  // Keep query in sync when value changes externally (e.g. swap)
  useEffect(() => { setQuery(value) }, [value])

  // Close on outside click
  useEffect(() => {
    function onMouseDown(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', onMouseDown)
    return () => document.removeEventListener('mousedown', onMouseDown)
  }, [])

  const filtered = ZIPCODES.filter(z => z.startsWith(query.toUpperCase())).slice(0, 300)

  function handleInput(e) {
    const v = e.target.value.toUpperCase()
    setQuery(v)
    onChange(v)
    setOpen(true)
  }

  function handleSelect(zip) {
    setQuery(zip)
    onChange(zip)
    setOpen(false)
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
  }

  return (
    <div ref={wrapRef} style={{ position: 'relative' }}>
      <div style={styles.inputWrapper}>
        <LocationDotIcon color={accentColor} />
        <input
          id={id}
          type="text"
          placeholder={placeholder}
          value={query}
          onChange={handleInput}
          onFocus={() => setOpen(true)}
          onKeyDown={handleKeyDown}
          style={styles.input}
          autoComplete="off"
          spellCheck={false}
        />
      </div>
      {open && filtered.length > 0 && (
        <div style={styles.dropdown}>
          {filtered.map(zip => (
            <div
              key={zip}
              style={styles.dropdownItem}
              onMouseDown={() => handleSelect(zip)}
              onMouseEnter={e => e.currentTarget.style.background = '#FEF3C7'}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {zip}
            </div>
          ))}
        </div>
      )}
      {open && query.length > 0 && filtered.length === 0 && (
        <div style={styles.dropdown}>
          <div style={styles.dropdownEmpty}>No matching zip codes</div>
        </div>
      )}
    </div>
  )
}

/* ── Main SearchForm ── */
export default function SearchForm({ onSearch, loading }) {
  const [from, setFrom] = useState('')
  const [to, setTo] = useState('')
  const [time, setTime] = useState(nowTime())
  const [validationError, setValidationError] = useState('')

  function handleSwap() {
    setFrom(to)
    setTo(from)
  }

  function handleSubmit(e) {
    e.preventDefault()
    if (!from.trim() || !to.trim()) {
      setValidationError('Please enter both zip codes.')
      return
    }
    setValidationError('')
    onSearch(from.trim(), to.trim(), time)
  }

  return (
    <div style={styles.container}>
      {/* Brand */}
      <div style={styles.brand}>
        <BusIcon />
        <span style={styles.brandName}>Via</span>
      </div>
      <p style={styles.subtitle}>Bus routing in Maastricht</p>

      <form onSubmit={handleSubmit} noValidate style={styles.form}>
        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="from-input">From</label>
          <ZipAutocomplete
            id="from-input"
            value={from}
            onChange={setFrom}
            placeholder="e.g. 6211AX"
            accentColor="#16A34A"
          />
        </div>

        <div style={styles.connector}>
          <span style={styles.connectorLine} />
          <button
            type="button"
            onClick={handleSwap}
            style={styles.swapBtn}
            title="Swap from / to"
          >
            <SwapIcon />
          </button>
          <span style={styles.connectorLine} />
        </div>

        <div style={styles.fieldGroup}>
          <label style={styles.label} htmlFor="to-input">To</label>
          <ZipAutocomplete
            id="to-input"
            value={to}
            onChange={setTo}
            placeholder="e.g. 6229HN"
            accentColor="#D97706"
          />
        </div>

        <div style={{ ...styles.fieldGroup, marginTop: 16 }}>
          <label style={styles.label} htmlFor="time-input">Departure time</label>
          <div style={styles.inputWrapper}>
            <ClockIcon />
            <select
              id="time-input"
              value={time}
              onChange={e => setTime(e.target.value)}
              style={styles.select}
            >
              {TIME_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>
        </div>

        {validationError && (
          <p style={styles.validationError}>{validationError}</p>
        )}

        <button
          type="submit"
          disabled={loading}
          style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
        >
          {loading ? (
            <><Spinner />Searching…</>
          ) : (
            <><SearchIcon />Find Route</>
          )}
        </button>
      </form>
    </div>
  )
}

/* ── Inline styles ── */
const styles = {
  container: {
    padding: '24px 24px 20px',
    borderBottom: '1px solid var(--color-divider)',
    flexShrink: 0,
  },
  brand: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginBottom: 4,
  },
  brandName: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--color-text)',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    fontSize: 13,
    color: 'var(--color-text-muted)',
    marginBottom: 20,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: 4,
  },
  fieldGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: 6,
  },
  label: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  inputWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    background: 'var(--color-card)',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    padding: '0 14px',
    height: 44,
    transition: 'border-color 150ms ease',
  },
  input: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text)',
    minWidth: 0,
  },
  select: {
    flex: 1,
    border: 'none',
    outline: 'none',
    background: 'transparent',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--color-text)',
    cursor: 'pointer',
    appearance: 'none',
    WebkitAppearance: 'none',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    zIndex: 100,
    background: '#FFFFFF',
    border: '1.5px solid var(--color-border)',
    borderRadius: 'var(--radius-md)',
    boxShadow: '0 4px 16px rgba(0,0,0,0.10)',
    maxHeight: 200,
    overflowY: 'auto',
    marginTop: 4,
  },
  dropdownItem: {
    padding: '9px 14px',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--color-text)',
    cursor: 'pointer',
    background: 'transparent',
    transition: 'background 80ms ease',
    fontFamily: 'monospace',
    letterSpacing: '0.04em',
  },
  dropdownEmpty: {
    padding: '10px 14px',
    fontSize: 13,
    color: 'var(--color-text-muted)',
    fontStyle: 'italic',
  },
  connector: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    padding: '4px 14px',
    color: 'var(--color-text-muted)',
  },
  connectorLine: {
    flex: 1,
    height: 1,
    background: 'var(--color-border)',
  },
  swapBtn: {
    background: 'none',
    border: '1px solid var(--color-border)',
    borderRadius: '50%',
    width: 28,
    height: 28,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    cursor: 'pointer',
    padding: 0,
    color: 'var(--color-text-muted)',
    transition: 'background 120ms ease, border-color 120ms ease',
    flexShrink: 0,
  },
  button: {
    marginTop: 12,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    height: 44,
    background: 'var(--color-primary)',
    color: 'var(--color-primary-text)',
    border: 'none',
    borderRadius: 'var(--radius-md)',
    fontSize: 14,
    fontWeight: 600,
    transition: 'background 150ms ease, opacity 150ms ease',
    userSelect: 'none',
    cursor: 'pointer',
  },
  buttonLoading: {
    opacity: 0.7,
    cursor: 'not-allowed',
  },
  validationError: {
    fontSize: 13,
    color: 'var(--color-error)',
    marginTop: 8,
  },
}

/* ── SVG Icons ── */
function BusIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="13" rx="2"/>
      <path d="M3 10h18M8 19v2M16 19v2"/>
      <circle cx="7.5" cy="15.5" r="1"/>
      <circle cx="16.5" cy="15.5" r="1"/>
    </svg>
  )
}

function LocationDotIcon({ color }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill={color} style={{ flexShrink: 0 }}>
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>
  )
}

function ClockIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function SwapIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 3L4 7l4 4M4 7h16M16 21l4-4-4-4M20 17H4"/>
    </svg>
  )
}

function SearchIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="11" cy="11" r="8"/>
      <path d="m21 21-4.35-4.35"/>
    </svg>
  )
}

function Spinner() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}>
      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
      <path d="M12 2a10 10 0 0 1 10 10"/>
    </svg>
  )
}
