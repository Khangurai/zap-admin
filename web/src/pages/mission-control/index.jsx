import React, { useEffect, useRef, useState } from "react";

const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

export default function GoogleMapsDirections() {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const directionsServiceRef = useRef(null);
  const directionsRendererRef = useRef(null);
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]);

  useEffect(() => {
    if (!window.google) {
      const googleScript = document.createElement("script");
      googleScript.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_API_KEY}&libraries=places`;
      googleScript.async = true;
      googleScript.defer = true;
      document.body.appendChild(googleScript);
      googleScript.onload = () => initializeMap();
    } else {
      initializeMap();
    }
  }, []);

  const initializeMap = () => {
    const map = new window.google.maps.Map(mapContainerRef.current, {
      center: { lat: 16.8, lng: 96.15 }, // Yangon
      zoom: 12,
      gestureHandling: "greedy",
    });
    mapRef.current = map;

    directionsServiceRef.current = new window.google.maps.DirectionsService();
    directionsRendererRef.current = new window.google.maps.DirectionsRenderer({
      map: map,
      panel: document.getElementById("directions-panel"),
      suppressMarkers: false,
      polylineOptions: {
        strokeColor: "#4882c5",
        strokeWeight: 8,
      },
    });

    setupAutocomplete();
  };

  const setupAutocomplete = () => {
    const originInput = document.getElementById("origin-input");
    const autocompleteOrigin = new window.google.maps.places.Autocomplete(
      originInput
    );
    autocompleteOrigin.addListener("place_changed", () => {
      const place = autocompleteOrigin.getPlace();
      if (place.geometry?.location) {
        setOrigin(place.geometry.location);
      }
    });

    const destinationInput = document.getElementById("destination-input");
    const autocompleteDestination = new window.google.maps.places.Autocomplete(
      destinationInput
    );
    autocompleteDestination.addListener("place_changed", () => {
      const place = autocompleteDestination.getPlace();
      if (place.geometry?.location) {
        setDestination(place.geometry.location);
      }
    });
  };

  useEffect(() => {
    if (
      origin &&
      destination &&
      directionsServiceRef.current &&
      directionsRendererRef.current
    ) {
      const wp = waypoints
        .filter((wp) => wp.location)
        .map((wp) => ({ location: wp.location, stopover: true }));

      directionsServiceRef.current.route(
        {
          origin,
          destination,
          waypoints: wp,
          travelMode: window.google.maps.TravelMode.DRIVING,
          unitSystem: window.google.maps.UnitSystem.METRIC,
          drivingOptions: {
            departureTime: new Date(),
            trafficModel: "bestguess",
          },
          provideRouteAlternatives: true,
        },
        (result, status) => {
          if (status === window.google.maps.DirectionsStatus.OK) {
            directionsRendererRef.current.setDirections(result);
          } else {
            console.error("Directions request failed due to " + status);
          }
        }
      );
    } else if (directionsRendererRef.current) {
      directionsRendererRef.current.setDirections(null);
    }
  }, [origin, destination, waypoints]);

  const handleAddWaypoint = () => {
    const id = `waypoint-${Date.now()}`;
    setWaypoints((prev) => [...prev, { id, location: null }]);
  };

  useEffect(() => {
    if (waypoints.length > 0 && window.google) {
      const newWaypoint = waypoints[waypoints.length - 1];
      const input = document.getElementById(newWaypoint.id);
      if (input) {
        const autocomplete = new window.google.maps.places.Autocomplete(input);
        autocomplete.addListener("place_changed", () => {
          const place = autocomplete.getPlace();
          if (place.geometry?.location) {
            const location = place.geometry.location;
            setWaypoints((prev) =>
              prev.map((wp) =>
                wp.id === newWaypoint.id ? { ...wp, location } : wp
              )
            );
          }
        });
      }
    }
  }, [waypoints]);

  return (
    <div style={{ position: "relative", width: "100%", height: "80vh" }}>
      <style>{`
        #directions-panel { background-color: #ffffff4b; border-radius: 8px; box-shadow: 0 2px 6px rgba(0, 0, 0, 1); padding: 10px; max-height: 300px; overflow: auto; }
        #directions-panel h2 { color: #3e69b8ff; }
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
        <div id="directions-panel" />
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
