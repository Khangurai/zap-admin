import React, { useEffect, useRef } from "react";
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';

// ✅ Correct way: Import GeoJSON (ensure it's a valid FeatureCollection)
import membersGeoJSON from "./members.js"; // Adjust path as needed

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const Index = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);

  // Initialize map
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, []);

  // Fetch and display optimized route
  useEffect(() => {
    // Extract waypoints from GeoJSON
    const waypoints = membersGeoJSON.features.map((f) => ({
      name: f.properties.name || "Unnamed",
      coordinates: f.geometry.coordinates, // [lng, lat]
    }));

    const limitedWaypoints = waypoints.slice(0, 12); // Max 12 supported

    if (limitedWaypoints.length < 2) {
      console.warn("Need at least 2 waypoints for routing.");
      return;
    }

    // Initialize map if not already done
    if (!map.current) {
      map.current = new mapboxgl.Map({
        container: mapContainer.current,
        style: "mapbox://styles/mapbox/streets-v11",
        center: limitedWaypoints[0].coordinates,
        zoom: 13,
      });

      map.current.addControl(new mapboxgl.NavigationControl());

      // Wait for map to fully load before adding layers
      map.current.on("load", () => {
        fetchAndRenderRoute(limitedWaypoints);
      });
    } else if (map.current.isStyleLoaded()) {
      fetchAndRenderRoute(limitedWaypoints);
    } else {
      map.current.on("load", () => {
        fetchAndRenderRoute(limitedWaypoints);
      });
    }
  }, []);

  const fetchAndRenderRoute = async (waypoints) => {
    try {
      // Clean and format coordinates safely
      const coordinates = waypoints
        .map((wp) => {
          const lon = parseFloat(wp.coordinates[0]).toFixed(6);
          const lat = parseFloat(wp.coordinates[1]).toFixed(6);
          return `${lon},${lat}`; // Ensures no extra spaces
        })
        .join(";");

      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${coordinates}?alternatives=false&geometries=geojson&language=en&overview=full&steps=true&roundtrip=false&access_token=${mapboxgl.accessToken}`;

      console.log("Fetching URL:", url); // 👈 DEBUG: Check for spaces!

      const res = await fetch(url);

      if (!res.ok) {
        const errorText = await res.text();
        console.error("HTTP Error:", res.status, errorText);
        return;
      }

      const data = await res.json();

      if (data.code !== "Ok") {
        console.error("Routing API error:", data.message || data);
        return;
      }

      const trip = data.trips[0];

      // Add or update route source and layer
      if (map.current.getSource("route")) {
        map.current.getSource("route").setData({
          type: "Feature",
          geometry: trip.geometry,
          properties: {},
        });
      } else {
        map.current.addSource("route", {
          type: "geojson",
          data: {
            type: "Feature",
            geometry: trip.geometry,
            properties: {},
          },
        });

        map.current.addLayer({
          id: "route",
          type: "line",
          source: "route",
          paint: {
            "line-color": "#3b9ddd",
            "line-width": 5,
          },
        });
      }

      // Remove existing markers
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];

      // Add markers in optimized order
      data.waypoints.forEach((wp) => {
        const original = waypoints[wp.waypoint_index];
        const marker = new mapboxgl.Marker()
          .setLngLat(original.coordinates)
          .setPopup(new mapboxgl.Popup().setText(original.name))
          .addTo(map.current);

        markersRef.current.push(marker);
      });

      // Fit map to route bounds
      const bounds = new mapboxgl.LngLatBounds();
      trip.geometry.coordinates.forEach((coord) => bounds.extend(coord));
      map.current.fitBounds(bounds, { padding: 50 });
    } catch (error) {
      console.error("Error fetching optimized route:", error);
    }
  };

  return <div ref={mapContainer} style={{ width: "100%", height: "600px" }} />;
};

export default Index;
