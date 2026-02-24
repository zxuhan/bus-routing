-- Table: shapes
-- This defines the actual path (line) the vehicle follows on a map.
CREATE TABLE shapes (
shape_id VARCHAR(100) NOT NULL,
shape_pt_sequence INT UNSIGNED NOT NULL,
shape_pt_lat DECIMAL(9, 6) NOT NULL,
shape_pt_lon DECIMAL(9, 6) NOT NULL,
shape_dist_traveled DECIMAL(12, 4),
-- Primary key is the combination of the ID and the point order
PRIMARY KEY (shape_id, shape_pt_sequence)
);

-- Table: stops_time
-- This links specific trips to the stops and refers back to the shapes.
CREATE TABLE stops_time (
    stop_id VARCHAR(50) NOT NULL,
    stop_name VARCHAR(255),
    stop_lat DECIMAL(9, 6) NOT NULL,
    stop_lon DECIMAL(9, 6) NOT NULL,
    trip_id VARCHAR(100) NOT NULL,
    stop_sequence INT UNSIGNED NOT NULL,
    -- Using VARCHAR for time because GTFS allows times over 24:00:00
    arrival_time VARCHAR(10),
    departure_time VARCHAR(10),
    trip_headsign VARCHAR(255),
    shape_dist_traveled DECIMAL(12, 4),
    shape_id VARCHAR(100),

    PRIMARY KEY (trip_id, stop_sequence),
    -- Index for faster lookups when joining with the shapes table
    INDEX idx_shape_id (shape_id),
);

-- Table: zip_lat_lon
-- Maps Dutch postal codes to geographic coordinates.
CREATE TABLE zip_lat_lon (
    zip      VARCHAR(10)    NOT NULL,
    lat      DECIMAL(11, 8) NOT NULL,
    lon      DECIMAL(11, 8) NOT NULL,
    PRIMARY KEY (zip)
);
