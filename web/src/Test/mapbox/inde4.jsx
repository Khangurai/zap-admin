import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import MapboxDirections from "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions";
import "@mapbox/mapbox-gl-directions/dist/mapbox-gl-directions.css";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function MapboxGoogleHybrid() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const directionsRef = useRef(null);
  const [waypoints, setWaypoints] = useState([]);
  const [waypointInputs, setWaypointInputs] = useState({});

  useEffect(() => {
    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/streets-v12",
      center: [96.15, 16.8], // Yangon
      zoom: 12,
    });
    mapRef.current = map;

    const directions = new MapboxDirections({
      accessToken: mapboxgl.accessToken,
      unit: "metric",
      profile: "mapbox/driving-traffic",
      controls: { inputs: false, instructions: true },
      styles: [
        {
          id: "directions-route-line-alt",
          type: "line",
          source: "directions",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#4882c5", "line-width": 8 },
          filter: [
            "all",
            ["in", "$type", "LineString"],
            ["in", "route", "alternate"],
          ],
        },
        {
          id: "directions-route-line-casing",
          type: "line",
          source: "directions",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#2d5f9a", "line-width": 12 },
          filter: [
            "all",
            ["in", "$type", "LineString"],
            ["in", "route", "selected"],
          ],
        },
        {
          id: "directions-route-line",
          type: "line",
          source: "directions",
          layout: { "line-cap": "round", "line-join": "round" },
          paint: { "line-color": "#4882c5", "line-width": 8 },
          filter: [
            "all",
            ["in", "$type", "LineString"],
            ["in", "route", "selected"],
          ],
        },
      ],
    });
    directionsRef.current = directions;
    map.addControl(directions, "top-left");

    if (!window.google) {
      const googleScript = document.createElement("script");
      googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      googleScript.async = true;
      googleScript.defer = true;
      document.body.appendChild(googleScript);
      googleScript.onload = () => setupAutocomplete();
    } else {
      setupAutocomplete();
    }

    return () => map.remove();
  }, []);

  const setupAutocomplete = () => {
    const originInput = document.getElementById("origin-input");
    const destinationInput = document.getElementById("destination-input");

    const setupListener = (input, setter) => {
      const autocomplete = new window.google.maps.places.Autocomplete(input);
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (place.geometry?.location) {
          const { lat, lng } = place.geometry.location;
          setter([lng(), lat()]);
        }
      });
    };

    setupListener(originInput, (coords) =>
      directionsRef.current.setOrigin(coords)
    );
    setupListener(destinationInput, (coords) =>
      directionsRef.current.setDestination(coords)
    );
  };

  const handleAddWaypoint = () => {
    const id = `waypoint-${Date.now()}`;
    const newWaypoint = { id, ref: React.createRef() };
    setWaypoints((prev) => [...prev, newWaypoint]);
  };

  useEffect(() => {
    if (waypoints.length > 0 && window.google) {
      const newWaypoint = waypoints[waypoints.length - 1];
      const input = document.getElementById(newWaypoint.id);
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        const listener = autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const { lat, lng } = place.geometry.location;
            const waypointIndex = waypoints.findIndex(
              (wp) => wp.id === newWaypoint.id
            );
            directionsRef.current.addWaypoint(waypointIndex, [lng(), lat()]);
          }
        });
        setWaypointInputs((prev) => ({
          ...prev,
          [newWaypoint.id]: { autocomplete, listener },
        }));
      }
    }
  }, [waypoints]);

  return (
    <div style={{ position: "relative", width: "100%", height: "80vh" }}>
      <style>{`
        .mapboxgl-ctrl-top-left .mapboxgl-ctrl { margin-top: 150px; margin-left: 10px; }
        .mapbox-directions-instructions { background-color: #ffffff4b; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); }
        .mapbox-directions-route-summary h1 { color: #3e69b8ff; }
      `}</style>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 1,
          backgroundColor: "white",
          padding: "10px",
          borderRadius: "8px",
          boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          gap: "10px",
          width: "320px",
        }}
      >
        <input
          id="origin-input"
          type="text"
          placeholder="Choose a starting point..."
          style={{
            width: "300px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        {waypoints.map((wp) => (
          <input
            key={wp.id}
            id={wp.id}
            type="text"
            placeholder="Add a stop..."
            style={{
              width: "300px",
              padding: "10px",
              border: "1px solid #ddd",
              borderRadius: "4px",
            }}
          />
        ))}
        <input
          id="destination-input"
          type="text"
          placeholder="Choose a destination..."
          style={{
            width: "300px",
            padding: "10px",
            border: "1px solid #ddd",
            borderRadius: "4px",
          }}
        />
        <button
          onClick={handleAddWaypoint}
          style={{
            padding: "10px",
            border: "none",
            borderRadius: "4px",
            backgroundColor: "#4882c5",
            color: "white",
            cursor: "pointer",
          }}
        >
          Add Waypoint
        </button>
      </div>
      <div
        ref={mapContainerRef}
        style={{
          width: "100%",
          height: "100%",
          borderRadius: "8px",
          overflow: "hidden",
        }}
      />
    </div>
  );
}
