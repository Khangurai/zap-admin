import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../../../server/supabase/supabaseClient";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER = { lat: 16.8409, lng: 96.1735 };
const ZOOM_LEVEL = 12;

const GH_API_KEY = "6292d5d3-1d52-410c-a880-bd4c51bcc321";

const Index = () => {
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markersRef = useRef([]);
  const [users, setUsers] = useState([]);

  // Fetch users from Supabase
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from("users")
        .select("id, name, team_code, latitude, longitude, location");

      if (error) {
        console.error("Error fetching users:", error);
        return;
      }

      const parsedUsers = data
        .map((user) => {
          let lat, lng;

          if (user.latitude !== null && user.longitude !== null) {
            lat = parseFloat(user.latitude);
            lng = parseFloat(user.longitude);
          } else if (user.location) {
            try {
              const match = user.location.match(
                /POINT\s*\(\s*([^\s]+)\s+([^\)]+)\)/
              );
              if (match) {
                lng = parseFloat(match[1]);
                lat = parseFloat(match[2]);
              }
            } catch (err) {
              console.error("Failed to parse location:", user.location, err);
            }
          }

          return {
            id: user.id,
            name: user.name || "Unknown",
            team_code: user.team_code,
            lat,
            lng,
          };
        })
        .filter((user) => user.lat && user.lng);

      setUsers(parsedUsers);
    };

    fetchUsers();
  }, []);

  // Initialize map and add markers + route
  useEffect(() => {
    if (map.current) return;

    const hasValidUsers = users.length > 0;
    const center = hasValidUsers
      ? [users[0].lng, users[0].lat]
      : [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center,
      zoom: ZOOM_LEVEL,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    map.current.on("load", async () => {
      addMarkersToMap(users);
      if (users.length > 1) {
        await drawRouteOnMap(map.current, users);
      }
    });

    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [users]);

  const addMarkersToMap = (users) => {
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    if (users.length === 0) {
      new mapboxgl.Marker({ color: "gray" })
        .setLngLat([DEFAULT_CENTER.lng, DEFAULT_CENTER.lat])
        .setPopup(new mapboxgl.Popup().setText("No users available"))
        .addTo(map.current);
      return;
    }

    const bounds = new mapboxgl.LngLatBounds();

    users.forEach((user) => {
      const { lat, lng, name, team_code } = user;
      const popup = new mapboxgl.Popup({ offset: 25 }).setHTML(
        `<strong>${name}</strong><br/>Team: ${team_code || "N/A"}`
      );

      const marker = new mapboxgl.Marker({ color: "#3b9ddd" })
        .setLngLat([lng, lat])
        .setPopup(popup)
        .addTo(map.current);

      markersRef.current.push(marker);
      bounds.extend([lng, lat]);
    });

    map.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
  };

  // GraphHopper Route Optimization helpers

  async function optimizeChunk(coords) {
    if (coords.length < 2) {
      throw new Error("At least 2 coordinates are required for optimization");
    }

    const jobs = coords.slice(1).map((coord, index) => ({
      id: index + 1,
      location: { lat: coord[1], lon: coord[0] },
    }));

    const requestBody = {
      vehicles: [
        {
          vehicle_id: "vehicle_1",
          type_id: "vehicleType_1",
          start_address: {
            location: {
              lat: coords[0][1],
              lon: coords[0][0],
            },
          },
        },
      ],
      vehicle_types: [
        {
          type_id: "vehicleType_1",
          profile: "car",
        },
      ],
      jobs,
    };

    const res = await fetch(
      `https://graphhopper.com/api/1/vrp/optimize?key=${GH_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      }
    );

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`HTTP ${res.status}: ${text}`);
    }

    const data = await res.json();
    const jobId = data.job_id || data.solution_id || data.id;
    if (!jobId) throw new Error("No job ID returned from optimization request");

    // Poll for solution
    let solution = null;
    for (let i = 0; i < 20; i++) {
      await new Promise((r) => setTimeout(r, 1000));
      const solutionRes = await fetch(
        `https://graphhopper.com/api/1/vrp/solution/${jobId}?key=${GH_API_KEY}`
      );
      const solutionData = await solutionRes.json();

      if (solutionData.status === "finished") {
        solution = solutionData;
        break;
      }
    }

    if (!solution) {
      throw new Error("GraphHopper optimization timed out");
    }

    const route = solution.solution?.routes?.[0];
    if (!route) throw new Error("No routes found in solution");

    return route.activities.map((act) => [act.location.lon, act.location.lat]);
  }

  async function getFullOptimizedRoute(points) {
    const coords = points.map((p) => [p.lng, p.lat]);
    return await optimizeChunk(coords);
  }

  async function drawRouteOnMap(map, points) {
    try {
      const routeCoords = await getFullOptimizedRoute(points);

      const routeGeoJSON = {
        type: "Feature",
        geometry: {
          type: "LineString",
          coordinates: routeCoords,
        },
      };

      if (map.getSource("route")) {
        map.getSource("route").setData(routeGeoJSON);
      } else {
        map.addSource("route", {
          type: "geojson",
          data: routeGeoJSON,
        });

        map.addLayer({
          id: "route",
          type: "line",
          source: "route",
          layout: {
            "line-cap": "round",
            "line-join": "round",
          },
          paint: {
            "line-color": "#3b9ddd",
            "line-width": 4,
          },
        });
      }
    } catch (err) {
      console.error("Route drawing failed", err);
    }
  }

  return <div ref={mapContainer} style={{ width: "100%", height: "600px" }} />;
};

export default Index;
