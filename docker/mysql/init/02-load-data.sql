LOAD DATA INFILE '/docker-entrypoint-initdb.d/shapes.csv'
INTO TABLE shapes
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(shape_id, shape_pt_sequence, shape_pt_lat, shape_pt_lon, @shape_dist_traveled)
SET shape_dist_traveled = NULLIF(@shape_dist_traveled, '');

SHOW WARNINGS;  -- ← add after each LOAD DATA to see what happened

SELECT ROW_COUNT() AS shapes_loaded;  -- ← confirm rows were inserted

LOAD DATA INFILE '/docker-entrypoint-initdb.d/stops_time.csv'
INTO TABLE stops_time
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(stop_id, stop_name, stop_lat, stop_lon, trip_id, stop_sequence, arrival_time, departure_time, trip_headsign, @shape_dist_traveled, @shape_id)
SET
    shape_dist_traveled = NULLIF(@shape_dist_traveled, ''),
    shape_id = NULLIF(@shape_id, '');

LOAD DATA INFILE '/docker-entrypoint-initdb.d/zip_lat_lon.csv'
INTO TABLE zip_lat_lon
FIELDS TERMINATED BY ',' ENCLOSED BY '"'
LINES TERMINATED BY '\n'
IGNORE 1 ROWS
(zip, lat, lon);