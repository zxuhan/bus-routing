import React from 'react'

export default function Directions({ items, noRoute, error }) {
  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <span style={styles.headerTitle}>Directions</span>
        {items && items.length > 0 && (
          <span style={styles.headerCount}>{items.length} steps</span>
        )}
      </div>

      <div style={styles.list}>
        {error ? (
          <div style={styles.errorBox}>
            <ErrorIcon />
            <p style={styles.errorText}>{error}</p>
          </div>
        ) : noRoute ? (
          <div style={styles.emptyBox}>
            <MapXIcon />
            <p style={styles.emptyTitle}>No route found</p>
            <p style={styles.emptySubtitle}>
              No bus route was found between these locations. Try different zip codes or a later departure time.
            </p>
          </div>
        ) : !items || items.length === 0 ? (
          <div style={styles.emptyBox}>
            <MapIcon />
            <p style={styles.emptyTitle}>Ready to navigate</p>
            <p style={styles.emptySubtitle}>
              Enter a starting and destination zip code above to find a route.
            </p>
          </div>
        ) : (
          items.map((step, i) => {
            const isFirst = i === 0
            const isLast = i === items.length - 1
            const isSummary = isLast && step.toLowerCase().startsWith('total')
            const isTimestamp = /^\d{2}:\d{2}:\d{2}--/.test(step)
            const isWalk = step.toLowerCase().startsWith('walk')
            const isTransfer = step.toLowerCase().startsWith('transfer')

            let icon = <StepDotIcon />
            if (isWalk) icon = <WalkIcon />
            else if (isTransfer) icon = <BusStepIcon />
            else if (isTimestamp || isFirst || isLast) icon = <PinIcon />
            if (isSummary) icon = <SummaryIcon />

            return (
              <div
                key={i}
                style={{
                  ...styles.stepItem,
                  ...(isSummary ? styles.stepSummary : {}),
                  ...(isFirst || (isTimestamp && i === 0) ? styles.stepFirst : {}),
                }}
              >
                <div style={styles.stepIconWrap}>{icon}</div>
                <p style={{
                  ...styles.stepText,
                  ...(isSummary ? styles.stepTextSummary : {}),
                  ...(isTimestamp ? styles.stepTextTimestamp : {}),
                }}>
                  {formatStep(step)}
                </p>
              </div>
            )
          })
        )}
      </div>
    </div>
  )
}

function formatStep(step) {
  // Convert "14:30:00--6211AX" → "14:30  ·  6211AX"
  const tsMatch = step.match(/^(\d{2}:\d{2}):\d{2}--(.+)$/)
  if (tsMatch) return `${tsMatch[1]}  ·  ${tsMatch[2]}`
  return step
}

/* ── Inline styles ── */
const styles = {
  container: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    overflow: 'hidden',
    padding: '16px 24px 24px',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
    flexShrink: 0,
  },
  headerTitle: {
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--color-text-muted)',
    textTransform: 'uppercase',
    letterSpacing: '0.06em',
  },
  headerCount: {
    fontSize: 11,
    fontWeight: 500,
    color: 'var(--color-primary)',
    background: 'var(--color-muted-bg)',
    padding: '2px 8px',
    borderRadius: 99,
    border: '1px solid var(--color-border)',
  },
  list: {
    flex: 1,
    overflowY: 'auto',
    display: 'flex',
    flexDirection: 'column',
    gap: 2,
  },
  stepItem: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '10px 12px',
    borderRadius: 'var(--radius-sm)',
    transition: 'background 120ms ease',
  },
  stepFirst: {
    background: 'var(--color-muted-bg)',
  },
  stepSummary: {
    background: 'var(--color-muted-bg)',
    border: '1px solid var(--color-border)',
    marginTop: 4,
  },
  stepIconWrap: {
    flexShrink: 0,
    width: 20,
    height: 20,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  stepText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-text)',
    flex: 1,
    overflowWrap: 'break-word',
    wordBreak: 'break-word',
    minWidth: 0,
  },
  stepTextTimestamp: {
    fontWeight: 600,
    color: 'var(--color-text)',
  },
  stepTextSummary: {
    fontWeight: 600,
    color: 'var(--color-primary)',
  },
  emptyBox: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    textAlign: 'center',
    gap: 8,
    padding: '40px 16px',
    color: 'var(--color-text-muted)',
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--color-text)',
    marginTop: 4,
  },
  emptySubtitle: {
    fontSize: 13,
    lineHeight: 1.6,
    color: 'var(--color-text-muted)',
  },
  errorBox: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: 10,
    padding: '12px 14px',
    background: 'var(--color-error-bg)',
    borderRadius: 'var(--radius-md)',
    border: '1px solid #FECACA',
    marginTop: 4,
  },
  errorText: {
    fontSize: 13,
    lineHeight: 1.5,
    color: 'var(--color-error)',
    flex: 1,
  },
}

/* ── SVG Icons ── */
function MapIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
    </svg>
  )
}

function MapXIcon() {
  return (
    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21"/>
      <line x1="9" y1="3" x2="9" y2="18"/>
      <line x1="15" y1="6" x2="15" y2="21"/>
      <line x1="14" y1="9" x2="20" y2="3"/>
    </svg>
  )
}

function StepDotIcon() {
  return (
    <svg width="8" height="8" viewBox="0 0 8 8">
      <circle cx="4" cy="4" r="3" fill="#D97706"/>
    </svg>
  )
}

function WalkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#64748B" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="13" cy="4" r="2"/>
      <path d="M10 9l-2 11M10 9l4 4 4-5M10 9l-4 2"/>
    </svg>
  )
}

function BusStepIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="5" width="18" height="13" rx="2"/>
      <path d="M3 10h18"/>
      <circle cx="7.5" cy="15.5" r="1" fill="#D97706"/>
      <circle cx="16.5" cy="15.5" r="1" fill="#D97706"/>
    </svg>
  )
}

function PinIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="#0F172A">
      <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/>
    </svg>
  )
}

function SummaryIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <polyline points="12 6 12 12 16 14"/>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: 1 }}>
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
