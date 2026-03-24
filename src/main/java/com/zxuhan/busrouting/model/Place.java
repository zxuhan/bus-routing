package com.zxuhan.busrouting.model;

import java.io.Serializable;
import java.util.Objects;

import static com.zxuhan.busrouting.util.CalculateDistance.distanceBetween;

/**
 * Represents a geographic place identified by a zip code, latitude, and longitude.
 */
public class Place implements Serializable{
    public String name;
    public String zipCode;
    public String type;
    public double lat;
    public double lon;


    public Place(double latitude, double longitude) {
        this.lat = latitude;
        this.lon = longitude;
    }

    public double distanceTo(double lat, double lon) {
        return distanceBetween(this.lat, this.lon, lat, lon);
    }

    public double getLatitude() {
        return lat;
    }
    public double getLongitude() {
        return lon;
    }
    public String getZipCode() {
        return zipCode;
    }

    @Override
    public String toString() {
        return "Place{" +
                "name='" + name + '\'' +
                ", postcode='" + zipCode + '\'' +
                ", latitude=" + lat +
                ", longitude=" + lon +
                '}';
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Place place = (Place) o;
        return Double.compare(place.lat, lat) == 0 && Double.compare(place.lon, lon) == 0;
    }

    @Override
    public int hashCode() {
        return Objects.hash(lat, lon);
    }

    public String getName() {
        return name;
    }

    public void setType(String type) {
        this.type = type;
    }

    public String getType() {
        return type;
    }
}
