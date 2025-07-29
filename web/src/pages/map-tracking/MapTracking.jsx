import React, { useState, useEffect, useRef } from "react";
import {
  APIProvider,
  ControlPosition,
  MapControl,
  AdvancedMarker,
  Map,
  useMap,
  useMapsLibrary,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

// const API_KEY =
//   globalThis.GOOGLE_MAPS_API_KEY ?? "AIzaSyCOU6RDFO5DFgyuh81BfL1wSBoWWKnmP4k";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY 

const MapTracking = () => {
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerRef, marker] = useAdvancedMarkerRef();

  return (
    <div style={{ height: "100vh", width: "100%" }}>
      <APIProvider apiKey={API_KEY}>
        <Map
          defaultZoom={3}
          defaultCenter={{ lat: 22.54992, lng: 0 }}
          gestureHandling="greedy"
          disableDefaultUI
          mapId="bf51a910020fa25a"
        >
          <AdvancedMarker ref={markerRef} position={null} />
          <MapHandler place={selectedPlace} marker={marker} />
        </Map>

        <MapControl position={ControlPosition.TOP}>
          <div
            style={{
              padding: "8px",
              background: "white",
              borderRadius: "4px",
              boxShadow: "0 2px 6px rgba(0,0,0,0.3)",
              margin: "8px",
            }}
          >
            <PlaceAutocomplete onPlaceSelect={setSelectedPlace} />
          </div>
        </MapControl>
      </APIProvider>
    </div>
  );
};

const MapHandler = ({ place, marker }) => {
  const map = useMap();

  useEffect(() => {
    if (!map || !place || !marker) return;

    const location = place.geometry?.location;
    if (!location) return;

    // Convert LatLng to plain lat/lng
    const lat = location.lat?.();
    const lng = location.lng?.();

    if (lat == null || lng == null) return;

    console.log("Moving to:", lat, lng);

    // Center and zoom
    map.setCenter({ lat, lng });
    map.setZoom(15);

    // Move marker
    marker.position = { lat, lng };
  }, [map, place, marker]);

  return null;
};

const PlaceAutocomplete = ({ onPlaceSelect }) => {
  const autocompleteRef = useRef(null);
  const placesLib = useMapsLibrary("places");

  useEffect(() => {
    if (!placesLib) return;

    const el = autocompleteRef.current;
    if (!el) return;

    const handler = (e) => {
      const place = e.detail?.place;
      console.log("Place selected:", place);
      if (place) {
        onPlaceSelect(place);
      }
    };

    el.addEventListener("gmp-placechange", handler);

    return () => {
      el.removeEventListener("gmp-placechange", handler);
    };
  }, [placesLib, onPlaceSelect]);

  return (
    <gmp-place-autocomplete
      ref={autocompleteRef}
      placeholder="Enter a location"
      request-options='{"fields":["geometry","name","formatted_address"]}'
      style={{
        width: "300px",
        height: "40px",
      }}
    />
  );
};

export default MapTracking;
