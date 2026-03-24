package com.zxuhan.busrouting.util;

import java.time.Duration;
import java.time.LocalTime;

public class CalculateTimeDiff {

    public static long calculateTimeDifference(LocalTime startTime, LocalTime endTime) {
        Duration duration = Duration.between(startTime, endTime);
        return duration.toMinutes();
    }
}
