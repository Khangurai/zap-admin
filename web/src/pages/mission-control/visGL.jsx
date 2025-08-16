import React, { useEffect, useRef, useState } from "react";
import { APIProvider, Map, MapControl, useMap, ControlPosition } from "@vis.gl/react-google-maps";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function VisGLHybrid() {
  const [startPlace, setStartPlace] = useState(null);
  const [endPlace, setEndPlace] = useState(null);
  const [waypoints, setWaypoints] = useState([]);
  const [optimizedOrder, setOptimizedOrder] = useState([]);
  const [routeData, setRouteData] = useState(null);

  return (
    <APIProvider apiKey={GOOGLE_API_KEY} libraries={["places"]}>
      <div style={{ height: "100vh", width: "100%" }}>
        <Map defaultZoom={5} defaultCenter={{ lat: 20, lng: 96 }} gestureHandling="greedy">
          <RouteRenderer routeData={routeData} onRouteChanged={setRouteData} />
        </Map>

        <MapControl position={ControlPosition.TOP}>
          <RoutePlanner
            startPlace={startPlace}
            endPlace={endPlace}
            waypoints={waypoints}
            setStartPlace={setStartPlace}
            setEndPlace={setEndPlace}
            setWaypoints={setWaypoints}
            onRouteReady={(data, order) => {
              setRouteData(data);
              setOptimizedOrder(order);
            }}
          />
        </MapControl>
      </div>
    </APIProvider>
  );
}

// Directions Renderer
function RouteRenderer({ routeData, onRouteChanged }) {
  const map = useMap();
  const rendererRef = useRef(null);

  useEffect(() => {
    if (!map) return;
    if (!rendererRef.current) {
      rendererRef.current = new google.maps.DirectionsRenderer({ draggable: true });
      rendererRef.current.setMap(map);
      rendererRef.current.addListener("directions_changed", () => {
        onRouteChanged(rendererRef.current.getDirections());
      });
    }
    if (routeData) rendererRef.current.setDirections(routeData);
  }, [map, routeData, onRouteChanged]);

  return null;
}

// Route Planner
function RoutePlanner({ startPlace, endPlace, waypoints, setStartPlace, setEndPlace, setWaypoints, onRouteReady }) {
  const startRef = useRef(null);
  const endRef = useRef(null);
  const waypointRef = useRef(null);
  const [autocompleteReady, setAutocompleteReady] = useState(false);

  // Initialize autocomplete
  useEffect(() => {
    if (!window.google || !window.google.maps || !window.google.maps.places) {
      const timer = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          clearInterval(timer);
          setAutocompleteReady(true);
        }
      }, 100);
      return () => clearInterval(timer);
    } else {
      setAutocompleteReady(true);
    }
  }, []);

  useEffect(() => {
    if (!autocompleteReady) return;

    const createAutocomplete = (ref, setter) => {
      const autocomplete = new google.maps.places.Autocomplete(ref.current, {
        fields: ["geometry", "name"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        setter(place);
      });
    };

    if (startRef.current) createAutocomplete(startRef, setStartPlace);
    if (endRef.current) createAutocomplete(endRef, setEndPlace);
    if (waypointRef.current) {
      const autocomplete = new google.maps.places.Autocomplete(waypointRef.current, {
        fields: ["geometry", "name"],
      });
      autocomplete.addListener("place_changed", () => {
        const place = autocomplete.getPlace();
        if (!place.geometry) return;
        setWaypoints((prev) => [...prev, place]);
        waypointRef.current.value = "";
      });
    }
  }, [autocompleteReady]);

  const calculateRoute = () => {
    if (!startPlace || !endPlace) return;

    const service = new google.maps.DirectionsService();
    service.route(
      {
        origin: startPlace.geometry.location,
        destination: endPlace.geometry.location,
        travelMode: google.maps.TravelMode.DRIVING,
        waypoints: waypoints.map((w) => ({
          location: w.geometry.location,
          stopover: true,
        })),
        optimizeWaypoints: true, // This is the correct way to optimize waypoints
      },
      (result, status) => {
        if (status === "OK") {
          onRouteReady(result);
          
          // If you need the optimized order, it's available in the response:
          // const optimizedOrder = result.routes[0].waypoint_order;
          // You can use this if needed
        }
      }
    );
  };

  const removeWaypoint = (index) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  return (
    <div style={{ padding: 8, background: "#fff", minWidth: 320, display: "flex", flexDirection: "column", gap: 8 }}>
      <input ref={startRef} placeholder="Start Location" style={{ padding: 8 }} />
      <input ref={endRef} placeholder="End Location" style={{ padding: 8 }} />
      <div style={{ display: "flex", gap: 8 }}>
        <input ref={waypointRef} placeholder="Add Waypoint" style={{ padding: 8, flex: 1 }} />
        <button onClick={calculateRoute} style={{ padding: "8px 16px", cursor: "pointer" }}>
          Calculate
        </button>
      </div>
      {waypoints.length > 0 && (
        <div style={{ maxHeight: 200, overflowY: "auto" }}>
          <strong>Waypoints:</strong>
          <ul style={{ margin: 0, paddingLeft: 20 }}>
            {waypoints.map((w, i) => (
              <li key={i} style={{ display: "flex", justifyContent: "space-between", marginBottom: 4 }}>
                <span>{w.name}</span>
                <button onClick={() => removeWaypoint(i)} style={{ marginLeft: 8 }}>
                  ×
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
