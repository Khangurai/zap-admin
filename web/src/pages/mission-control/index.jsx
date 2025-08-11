import React, { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { supabase } from "../../../server/supabase/supabaseClient";

mapboxgl.accessToken = import.meta.env.VITE_MAPBOX_TOKEN;

const DEFAULT_CENTER = { lat: 16.8409, lng: 96.1735 };
const ZOOM_LEVEL = 12;

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

          // Prefer explicit latitude/longitude
          if (user.latitude !== null && user.longitude !== null) {
            lat = parseFloat(user.latitude);
            lng = parseFloat(user.longitude);
          }
          // Fallback: parse PostGIS `location` (assumed EWKT like: "POINT(longitude latitude)")
          else if (user.location) {
            try {
              const match = user.location.match(
                /POINT\s*\(\s*([^\s]+)\s+([^\)]+)/
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
        .filter((user) => user.lat && user.lng); // Only keep valid coordinates

      setUsers(parsedUsers);
    };

    fetchUsers();
  }, []);

  // Initialize map and add markers
  useEffect(() => {
    if (map.current) return; // Prevent re-initialization

    // Determine initial center
    const hasValidUsers = users.length > 0;
    const center = hasValidUsers
      ? [users[0].lng, users[0].lat] // Use first user
      : [DEFAULT_CENTER.lng, DEFAULT_CENTER.lat];

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: "mapbox://styles/mapbox/streets-v11",
      center,
      zoom: ZOOM_LEVEL,
    });

    map.current.addControl(new mapboxgl.NavigationControl());

    // Add markers once map is loaded
    map.current.on("load", () => {
      addMarkersToMap(users);
    });

    // Cleanup on unmount
    return () => {
      if (map.current) {
        map.current.remove();
        map.current = null;
      }
      markersRef.current.forEach((marker) => marker.remove());
      markersRef.current = [];
    };
  }, [users]); // Re-run when users change

  // Function to add markers
  const addMarkersToMap = (users) => {
    // Remove existing markers
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

    // Fit map to show all markers
    map.current.fitBounds(bounds, { padding: 60, maxZoom: 15 });
  };

  return <div ref={mapContainer} style={{ width: "100%", height: "600px" }} />;
};

export default Index;
