package com.zxuhan.busrouting.repository;

import com.zxuhan.busrouting.model.BusRouteShape;
import com.zxuhan.busrouting.model.BusStop;
import com.zxuhan.busrouting.model.Graph;
import com.zxuhan.busrouting.model.Place;
import com.zxuhan.busrouting.model.Trip;
import org.springframework.stereotype.Repository;

import jakarta.annotation.PostConstruct;
import javax.sql.DataSource;
import java.sql.*;
import java.time.LocalTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

/**
 * The GraphRepository class is responsible for building the graph by retrieving data from the database.
 */
@Repository
public class GraphRepository {
    private final Graph graph;
    private final DataSource dataSource;

    public GraphRepository(Graph graph, DataSource dataSource) {
        this.graph = graph;
        this.dataSource = dataSource;
    }

    /**
     * Retrieves bus stop data from the database and adds it to the graph.
     *
     * @throws SQLException If an SQL error occurs.
     */
    @PostConstruct
    public void getBusStops() throws SQLException {
        String query = "SELECT stop_id, stop_name, stop_lat, stop_lon, trip_id, stop_sequence, arrival_time, departure_time, trip_headsign, shape_dist_traveled, shape_id " +
                "FROM stops_time " +
                "WHERE stop_name LIKE '%Maastricht,%' AND trip_id NOT IN (SELECT trip_id FROM stops_time mst WHERE arrival_time LIKE '24:%' OR arrival_time LIKE '25:%') " +
                "ORDER BY trip_id, stop_sequence; ";

        BusStop previousStop = null;
        int previousTripId = -1;
        Trip prevTrip = null;

        try (Connection conn = dataSource.getConnection();
             Statement stmt = conn.createStatement();
             ResultSet rs = stmt.executeQuery(query)) {
            while (rs.next()) {
                int stopId = rs.getInt("stop_id");
                String stopName = rs.getString("stop_name");
                double stopLat = rs.getDouble("stop_lat");
                double stopLon = rs.getDouble("stop_lon");
                int tripId = rs.getInt("trip_id");
                int stopSequence = rs.getInt("stop_sequence");
                String arriveTime = rs.getString("arrival_time");
                String departureTime = rs.getString("departure_time");
                String tripHeadSign = rs.getString("trip_headsign");
                int shapeDistTraveled = rs.getInt("shape_dist_traveled");
                int shapeId = rs.getInt("shape_id");

                BusStop currentStop = new BusStop(stopId, stopName, stopLat, stopLon);
                Trip currTrip = new Trip(tripId, convertToLocalTime(arriveTime), convertToLocalTime(departureTime), tripHeadSign, shapeDistTraveled, shapeId);
                graph.addVertex(currentStop);

                if (previousStop != null && prevTrip != null && tripId == previousTripId) {
                    LocalTime aTime = convertToLocalTime(arriveTime);
                    LocalTime dTime = prevTrip.getDepartureTime();
                    int distance = shapeDistTraveled - prevTrip.getShapeDistTraveled();
                    Trip trip = new Trip(tripId, aTime, dTime, tripHeadSign, distance, shapeId);
                    graph.addEdge(previousStop, currentStop, trip, tripHeadSign);
                }

                previousStop = currentStop;
                previousTripId = tripId;
                prevTrip = currTrip;
            }
        }
    }

    /**
     * Finds a Place by zip code from the database.
     *
     * @param zipCode The zip code to search for (e.g. "6211AX").
     * @return A Place object, or null if not found.
     */
    public Place findPlaceByZipCode(String zipCode) {
        String query = "SELECT zip, lat, lon FROM zip_lat_lon WHERE zip = ?";

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setString(1, zipCode);

            try (ResultSet rs = stmt.executeQuery()) {
                if (rs.next()) {
                    double lat = rs.getDouble("lat");
                    double lon = rs.getDouble("lon");
                    return new Place(lat, lon);
                }
            }
        } catch (SQLException e) {
            throw new RuntimeException("Failed to look up zip code: " + zipCode, e);
        }

        return null;
    }

    /**
     * Retrieves the shape data for a given shape ID from the database.
     *
     * @param shapeId The shape ID to retrieve data for.
     * @return A list of BusRouteShape objects representing the shape.
     * @throws SQLException If an SQL error occurs.
     */
    public List<BusRouteShape> getBusRouteShapes(int shapeId) throws SQLException {
        String query = "SELECT shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon, shape_dist_traveled " +
                "FROM shapes " +
                "WHERE shape_id = ?; ";

        List<BusRouteShape> shapes = new ArrayList<>();

        try (Connection conn = dataSource.getConnection();
             PreparedStatement stmt = conn.prepareStatement(query)) {
            stmt.setInt(1, shapeId);

            try (ResultSet rs = stmt.executeQuery()) {
                while (rs.next()) {
                    int shapeID = rs.getInt("shape_id");
                    int shapePtSequence = rs.getInt("shape_pt_sequence");
                    double shapePtLat = rs.getDouble("shape_pt_lat");
                    double shapePtLon = rs.getDouble("shape_pt_lon");
                    double shapeDistTraveled = rs.getDouble("shape_dist_traveled");

                    shapes.add(new BusRouteShape(shapeID, shapePtSequence, shapePtLat, shapePtLon, shapeDistTraveled));
                }
            }
        }

        return shapes;
    }

    /**
     * Converts a time string to a LocalTime object.
     *
     * @param timeStr The time string in "HH:mm:ss" format.
     * @return The corresponding LocalTime object.
     */
    public static LocalTime convertToLocalTime(String timeStr) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("HH:mm:ss");
        return LocalTime.parse(timeStr, formatter);
    }
}