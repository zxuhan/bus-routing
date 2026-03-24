const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080'

/**
 * Fetch a bus route from the backend.
 * @param {string} from  Origin zip code
 * @param {string} to    Destination zip code
 * @param {string} time  Departure time in HH:mm format
 * @returns {Promise<{points: Array<{lat:number,lng:number}>, directions: string[], found: boolean} | null>}
 *          null when no route is found (HTTP 204)
 */
export async function fetchRoute(from, to, time) {
  // Backend expects HH:mm:ss
  const timeFull = time.length === 5 ? `${time}:00` : time

  const url = `${BASE_URL}/route?from=${encodeURIComponent(from)}&to=${encodeURIComponent(to)}&time=${encodeURIComponent(timeFull)}`
  const res = await fetch(url)

  if (res.status === 204) return null

  if (!res.ok) {
    let msg = `Server error ${res.status}`
    try {
      const body = await res.json()
      if (body.error) msg = body.error
    } catch {
      // ignore parse error
    }
    throw new Error(msg)
  }

  return res.json()
}
