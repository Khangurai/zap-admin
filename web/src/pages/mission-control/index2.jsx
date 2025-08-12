import React, { useEffect, useState, useRef } from "react";
import mapboxgl from "mapbox-gl";

mapboxgl.accessToken =
  "pk.eyJ1Ijoia2FpNzgiLCJhIjoiY203aHdjejV0MTEzNjJqc2NqNjR3aGF4ZyJ9.p1YYR6zn9FZhjdzROGhcqg";

const rawData = [
  { team_code: "TEAM194", name: "Aung Kyaw", location: "SRID=4326;POINT(96.171004 16.776474)" },
  { team_code: "TEAM820", name: "Zaw Min", location: "SRID=4326;POINT(96.168959 16.776539)" },
  { team_code: "TEAM286", name: "Mya Hnin", location: "SRID=4326;POINT(96.16733 16.778781)" },
  { team_code: "TEAM698", name: "Ko Ko", location: "SRID=4326;POINT(96.161588 16.78585)" },
  { team_code: "TEAM851", name: "Aye Chan", location: "SRID=4326;POINT(96.14788 16.786012)" },
  { team_code: "TEAM344", name: "Soe Win", location: "SRID=4326;POINT(96.143969 16.779877)" },
  { team_code: "TEAM289", name: "Hla Hla", location: "SRID=4326;POINT(96.13744 16.780137)" },
  { team_code: "TEAM570", name: "Thura", location: "SRID=4326;POINT(96.131666 16.780642)" },
  { team_code: "TEAM517", name: "Than Myint", location: "SRID=4326;POINT(96.122994 16.793038)" },
  { team_code: "TEAM363", name: "Moe Moe", location: "SRID=4326;POINT(96.122292 16.802123)" },
  { team_code: "TEAM544", name: "Nay Lin", location: "SRID=4326;POINT(96.133012 16.804693)" },
];

// Origin and destination coordinates
const origin = [96.175772, 16.77122];
const destination = [96.128566, 16.815558];

function parsePoint(locationStr) {
  const matched = locationStr.match(/POINT\(([-\d\.]+) ([-\d\.]+)\)/);
  if (!matched) return null;
  return [parseFloat(matched[1]), parseFloat(matched[2])];
}

export default function OptimizedRouteMap() {
  const mapContainer = useRef(null);
  const map = useRef(null);

  useEffect(() => {
    if (map.current) return; // initialize once

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center: origin,
      zoom: 12,
    });
  }, []);

  useEffect(() => {
    if (!map.current) return;

    // Parse points
    const waypoints = rawData.map((item) => parsePoint(item.location)).filter(Boolean);

    // Remove origin and destination from waypoints if exist
    const filteredWaypoints = waypoints.filter(
      (coord) =>
        !(coord[0] === origin[0] && coord[1] === origin[1]) &&
        !(coord[0] === destination[0] && coord[1] === destination[1])
    );

    // Mapbox free tier limit: max 12 coords total, so max 10 waypoints here
    const limitedWaypoints = filteredWaypoints.slice(0, 10);

    const coordsForOptimization = [origin, ...limitedWaypoints, destination];
    const coordsStr = coordsForOptimization.map((c) => c.join(",")).join(";");

    async function fetchOptimizedRoute() {
      try {
        const url = `https://api.mapbox.com/optimized-trips/v1/mapbox/driving/${coordsStr}?source=first&destination=last&roundtrip=false&geometries=geojson&access_token=${mapboxgl.accessToken}`;
        const res = await fetch(url);
        const data = await res.json();
        console.log("Optimization API response:", data);

        if (!data.trips || data.trips.length === 0) {
          alert("No optimized trip found");
          return;
        }

        drawRouteOnMap(data.trips[0].geometry, data.waypoints);
      } catch (err) {
        console.error("Optimization API error:", err);
        alert("Failed to fetch optimized route");
      }
    }

    function drawRouteOnMap(routeGeometry, waypoints) {
      // Remove old route if any
      if (map.current.getSource("route")) {
        map.current.removeLayer("route");
        map.current.removeSource("route");
      }

      // Add route source and layer
      map.current.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: routeGeometry,
        },
      });

      map.current.addLayer({
        id: "route",
        type: "line",
        source: "route",
        layout: { "line-join": "round", "line-cap": "round" },
        paint: { "line-color": "#3b82f6", "line-width": 6 },
      });

      // Add markers for each waypoint
      waypoints.forEach((wp) => {
        const el = document.createElement("div");
        el.className = "marker";
        el.style.backgroundColor = "#ef4444";
        el.style.width = "14px";
        el.style.height = "14px";
        el.style.borderRadius = "50%";

        new mapboxgl.Marker(el)
          .setLngLat(wp.location) // wp.location is [lon, lat]
          .setPopup(new mapboxgl.Popup({ offset: 25 }).setText(wp.name))
          .addTo(map.current);
      });

      // Fit map to route bounds
      const coordinates = routeGeometry.coordinates;
      const bounds = coordinates.reduce(
        (b, coord) => b.extend(coord),
        new mapboxgl.LngLatBounds(coordinates[0], coordinates[0])
      );
      map.current.fitBounds(bounds, { padding: 50 });
    }

    fetchOptimizedRoute();
  }, []);

  return (
    <>
      <div
        ref={mapContainer}
        style={{ width: "100%", height: "600px", borderRadius: "8px" }}
      />
      <style>{`
        .marker {
          cursor: pointer;
          border: 2px solid white;
          box-shadow: 0 0 2px rgba(0,0,0,0.5);
        }
      `}</style>
    </>
  );
}
