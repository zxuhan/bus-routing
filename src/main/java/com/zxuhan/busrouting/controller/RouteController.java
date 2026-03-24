package com.zxuhan.busrouting.controller;

import com.zxuhan.busrouting.service.RouteService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalTime;
import java.util.Map;

/**
 * REST controller for route lookups.
 *
 * Example request:
 *   GET /route?from=6211AX&to=6229HN&time=14:30:00
 */
@RestController
@RequestMapping("/route")
public class RouteController {

    private final RouteService routeService;

    public RouteController(RouteService routeService) {
        this.routeService = routeService;
    }

    @GetMapping
    public ResponseEntity<RouteService.RouteResult> getRoute(
            @RequestParam String from,
            @RequestParam String to,
            @RequestParam(required = false)
            @DateTimeFormat(iso = DateTimeFormat.ISO.TIME) LocalTime time) throws Exception {

        LocalTime departureTime = (time != null) ? time : LocalTime.now().withSecond(0).withNano(0);

        RouteService.RouteResult result = routeService.findRoute(from, to, departureTime);

        if (!result.found()) {
            return ResponseEntity.noContent().build(); // 204 — no path found
        }
        return ResponseEntity.ok(result);
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<Map<String, String>> handleBadZip(IllegalArgumentException ex) {
        return ResponseEntity.badRequest().body(Map.of("error", ex.getMessage()));
    }
}