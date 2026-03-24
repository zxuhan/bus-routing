package com.zxuhan.busrouting.service;

import com.zxuhan.busrouting.algorithm.AStar;
import com.zxuhan.busrouting.model.Place;
import com.zxuhan.busrouting.repository.GraphRepository;
import org.springframework.stereotype.Service;

import java.time.LocalTime;
import java.util.ArrayList;
import java.util.List;

@Service
public class RouteService {

    private final AStar aStar;
    private final GraphRepository graphRepository;

    public RouteService(AStar aStar, GraphRepository graphRepository) {
        this.aStar = aStar;
        this.graphRepository = graphRepository;
    }

    /**
     * Finds a route between two zip codes.
     *
     * @param fromZip  Origin zip code (e.g. "6211AX").
     * @param toZip    Destination zip code (e.g. "6229HN").
     * @param time     Departure time (e.g. LocalTime.of(14, 30)).
     * @return RouteResult with a list of lat/lng points and directions, or empty result if no path found.
     */
    public RouteResult findRoute(String fromZip, String toZip, LocalTime time) throws Exception {
        Place startPlace = resolvePlaceOrThrow(fromZip);
        Place endPlace   = resolvePlaceOrThrow(toZip);

        List<Place> path;
        List<String> directions;
        synchronized (aStar) {
            path = aStar.findShortestPath(startPlace, endPlace, time);
            directions = new ArrayList<>(aStar.getDirections());
        }

        if (path.isEmpty()) {
            return new RouteResult(List.of(), List.of(), false);
        }

        List<LatLng> points = path.stream()
                .map(p -> new LatLng(p.lat, p.lon))
                .toList();
        return new RouteResult(points, directions, true);
    }

    private Place resolvePlaceOrThrow(String zipCode) {
        Place place = graphRepository.findPlaceByZipCode(zipCode);
        if (place == null) {
            throw new IllegalArgumentException("Unknown zip code: " + zipCode);
        }
        return place;
    }

    /** A single lat/lng coordinate, named to match the Google Maps JS API field names. */
    public record LatLng(double lat, double lng) {}

    /**
     * Immutable result returned to the controller.
     *
     * @param points     Ordered list of lat/lng coordinates forming the route path.
     * @param directions Human-readable turn-by-turn directions.
     * @param found      False when no path exists between the two locations.
     */
    public record RouteResult(List<LatLng> points, List<String> directions, boolean found) {}
}