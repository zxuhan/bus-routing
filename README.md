# Via — Bus Routing in Maastricht

A full-stack web app that finds optimal bus routes between any two zip codes in Maastricht, with real-time directions and an interactive map.

<screenshot_placeholder>


## What I Built

**Backend (Java / Spring Boot)**
- Implemented **A\* pathfinding** over a live transit graph built from GTFS data (bus stops, trips, shapes, timetables)
- Graph nodes are bus stops loaded from a MySQL database; edges represent bus trips (with scheduled departure/arrival times) and walking segments
- Walking distances are fetched from the **Google Maps Distance Matrix API** for accuracy
- Route response includes an ordered list of lat/lng coordinates (for map rendering) and human-readable turn-by-turn directions

**Frontend (React + Vite)**
- Split-panel UI: search form with zip code autocomplete on the left, Google Maps polyline route on the right
- Markers distinguish the origin (green) and destination (amber) stops
- Directions panel shows timestamped stops, transfers, and walking segments

## Tech Stack

| Layer | Stack |
|---|---|
| Backend | Java 21, Spring Boot, MySQL |
| Algorithm | A* search (custom implementation) |
| External APIs | Google Maps Distance Matrix, Google Maps JS |
| Frontend | React 18, Vite, `@react-google-maps/api` |

## How It Works

1. User enters origin/destination zip codes and departure time
2. Backend resolves zip codes to lat/lng coordinates from the database
3. A\* runs over the transit graph, respecting bus timetables — it only boards a trip if the bus hasn't left yet
4. The algorithm chooses the path that minimises total travel time (waiting + riding + walking)
5. Route shapes are retrieved from the database and returned as a polyline to the frontend

## Running Locally

**Backend** — requires MySQL with GTFS data and a Google Maps API key:
```bash
DB_URL=... DB_USER=... DB_PASSWORD=... GOOGLE_MAPS_API_KEY=... ./mvnw spring-boot:run
```

**Frontend:**
```bash
cd frontend
cp .env.example .env   # add VITE_GOOGLE_MAPS_API_KEY
npm install && npm run dev
```

Then open `http://localhost:5173` and search between any two Maastricht zip codes (e.g. `6211SM` → `6229EG`).
