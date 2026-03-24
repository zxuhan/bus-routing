import React, { useCallback, useEffect, useRef } from 'react'
import { GoogleMap, useJsApiLoader, Marker } from '@react-google-maps/api'

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || ''

const DEFAULT_CENTER = { lat: 50.851, lng: 5.691 }
const DEFAULT_ZOOM = 14

// Subtle warm-toned map style
const MAP_STYLE = [
  { elementType: 'geometry', stylers: [{ color: '#f5f0e8' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#4a4035' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#f5f0e8' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#ffffff' }] },
  { featureType: 'road', elementType: 'geometry.stroke', stylers: [{ color: '#e8ddd0' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#f8ede0' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#e0c9a8' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#c9e0f0' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#6b8fa8' }] },
  { featureType: 'poi', elementType: 'geometry', stylers: [{ color: '#ede8dc' }] },
  { featureType: 'poi.park', elementType: 'geometry', stylers: [{ color: '#d4e8c8' }] },
  { featureType: 'poi.park', elementType: 'labels.text.fill', stylers: [{ color: '#6a8f5a' }] },
  { featureType: 'transit', elementType: 'geometry', stylers: [{ color: '#f0e8d8' }] },
  { featureType: 'administrative', elementType: 'geometry.stroke', stylers: [{ color: '#c8b8a0' }] },
  { featureType: 'administrative.land_parcel', elementType: 'labels.text.fill', stylers: [{ color: '#9a8878' }] },
]

const MAP_OPTIONS = {
  styles: MAP_STYLE,
  zoomControl: true,
  scrollwheel: true,
  draggable: true,
  mapTypeControl: false,
  streetViewControl: false,
  fullscreenControl: false,
  clickableIcons: false,
  disableDoubleClickZoom: false,
}

const POLYLINE_OPTIONS = {
  strokeColor: '#EA580C',
  strokeWeight: 5,
  strokeOpacity: 0.9,
  geodesic: true,
}

// SVG marker icons (Data URIs)
const originMarkerIcon = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
        </filter>
      </defs>
      <path filter="url(#shadow)" fill="#16A34A" d="M16 2C9.37 2 4 7.37 4 14c0 9.63 12 24 12 24S28 23.63 28 14C28 7.37 22.63 2 16 2z"/>
      <circle cx="16" cy="14" r="5" fill="white"/>
    </svg>
  `)}`,
  scaledSize: { width: 32, height: 40 },
  anchor: { x: 16, y: 40 },
}

const destinationMarkerIcon = {
  url: `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="32" height="40" viewBox="0 0 32 40">
      <defs>
        <filter id="shadow" x="-30%" y="-20%" width="160%" height="160%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" flood-color="#00000033"/>
        </filter>
      </defs>
      <path filter="url(#shadow)" fill="#D97706" d="M16 2C9.37 2 4 7.37 4 14c0 9.63 12 24 12 24S28 23.63 28 14C28 7.37 22.63 2 16 2z"/>
      <circle cx="16" cy="14" r="5" fill="white"/>
    </svg>
  `)}`,
  scaledSize: { width: 32, height: 40 },
  anchor: { x: 16, y: 40 },
}

export default function MapView({ points }) {
  const mapRef = useRef(null)
  const polylineRef = useRef(null)

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: API_KEY,
    id: 'google-map-script',
  })

  const onLoad = useCallback((map) => {
    mapRef.current = map
    polylineRef.current = new window.google.maps.Polyline({
      ...POLYLINE_OPTIONS,
      map,
      path: [],
    })
  }, [])

  const onUnmount = useCallback(() => {
    if (polylineRef.current) {
      polylineRef.current.setMap(null)
      polylineRef.current = null
    }
    mapRef.current = null
  }, [])

  // Update polyline path and map view whenever points change
  useEffect(() => {
    if (!polylineRef.current || !mapRef.current) return

    polylineRef.current.setPath(points || [])

    if (!points || points.length < 2) {
      mapRef.current.setCenter(DEFAULT_CENTER)
      mapRef.current.setZoom(DEFAULT_ZOOM)
      return
    }

    const bounds = new window.google.maps.LatLngBounds()
    points.forEach(p => bounds.extend(p))
    mapRef.current.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 })
  }, [points])

  if (loadError) {
    return (
      <div style={styles.errorContainer}>
        <p style={styles.errorTitle}>Map failed to load</p>
        <p style={styles.errorMsg}>Check your Google Maps API key in the .env file.</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div style={styles.loadingContainer}>
        <MapLoadingSpinner />
        <p style={styles.loadingText}>Loading map…</p>
      </div>
    )
  }

  const hasRoute = points && points.length >= 2
  const origin = hasRoute ? points[0] : null
  const destination = hasRoute ? points[points.length - 1] : null

  return (
    <GoogleMap
      mapContainerStyle={styles.mapContainer}
      center={DEFAULT_CENTER}
      zoom={DEFAULT_ZOOM}
      options={MAP_OPTIONS}
      onLoad={onLoad}
      onUnmount={onUnmount}
    >
      {hasRoute && (
        <>
          <Marker
            position={origin}
            icon={originMarkerIcon}
            title="Origin"
            zIndex={10}
          />
          <Marker
            position={destination}
            icon={destinationMarkerIcon}
            title="Destination"
            zIndex={10}
          />
        </>
      )}
    </GoogleMap>
  )
}

const styles = {
  mapContainer: {
    width: '100%',
    height: '100vh',
  },
  loadingContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#f5f0e8',
    gap: 12,
  },
  loadingText: {
    fontSize: 14,
    color: 'var(--color-text-muted)',
  },
  errorContainer: {
    width: '100%',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    background: '#FEF2F2',
    gap: 8,
    padding: 32,
    textAlign: 'center',
  },
  errorTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: 'var(--color-error)',
  },
  errorMsg: {
    fontSize: 13,
    color: 'var(--color-text-muted)',
  },
}

function MapLoadingSpinner() {
  return (
    <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round">
      <style>{`@keyframes mapSpin { to { transform: rotate(360deg) } }`}</style>
      <g style={{ animation: 'mapSpin 1s linear infinite', transformOrigin: '12px 12px' }}>
        <path d="M12 2a10 10 0 0 1 10 10" strokeOpacity="1"/>
        <path d="M22 12a10 10 0 0 1-10 10" strokeOpacity="0.5"/>
        <path d="M12 22a10 10 0 0 1-10-10" strokeOpacity="0.25"/>
      </g>
    </svg>
  )
}
