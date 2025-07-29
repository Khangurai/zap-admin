import React, { useState, useRef, useEffect } from "react";
import {
  APIProvider,
  Map,
  useMap,
  useMapsLibrary,
  AdvancedMarker,
  DirectionsRenderer
} from "@vis.gl/react-google-maps";
import { Input, Button, Card } from "antd";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY 

const RouterGenerator = () => {
  return (
    <APIProvider
      apiKey={GOOGLE_MAPS_API_KEY}
      libraries={["places"]}
    >
      <MapWithRouter />
    </APIProvider>
  );
};

const MapWithRouter = () => {
  const [mapCenter, setMapCenter] = useState({ lat: 16.8409, lng: 96.1735 }); // Yangon
  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState("");
  const [duration, setDuration] = useState("");

  const originRef = useRef();
  const destinationRef = useRef();

  const map = useMap();
  const placesLib = useMapsLibrary("places");
  const [autocompleteOrigin, setAutocompleteOrigin] = useState(null);
  const [autocompleteDest, setAutocompleteDest] = useState(null);

  useEffect(() => {
    if (!placesLib || !originRef.current || !destinationRef.current) return;

    const originAC = new placesLib.Autocomplete(originRef.current);
    originAC.addListener("place_changed", () => {
      const place = originAC.getPlace();
      setMapCenter(place.geometry.location.toJSON());
    });
    setAutocompleteOrigin(originAC);

    const destAC = new placesLib.Autocomplete(destinationRef.current);
    setAutocompleteDest(destAC);
  }, [placesLib]);

  const handleRoute = () => {
    if (!autocompleteOrigin || !autocompleteDest) return;

    const originPlace = autocompleteOrigin.getPlace();
    const destPlace = autocompleteDest.getPlace();

    if (!originPlace?.geometry || !destPlace?.geometry) {
      alert("Please select valid places.");
      return;
    }

    const directionsService = new window.google.maps.DirectionsService();
    directionsService.route(
      {
        origin: originPlace.geometry.location,
        destination: destPlace.geometry.location,
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (result, status) => {
        if (status === "OK" && result) {
          setDirections(result);
          const leg = result.routes[0].legs[0];
          setDistance(leg.distance.text);
          setDuration(leg.duration.text);
        } else {
          alert("Directions request failed: " + status);
        }
      }
    );
  };

  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <div style={{ width: 300, padding: 16, background: "#fff", zIndex: 1 }}>
        <h2>Router Generator</h2>
        <Input
          placeholder="Origin"
          ref={originRef}
          style={{ marginBottom: 8 }}
        />
        <Input
          placeholder="Destination"
          ref={destinationRef}
          style={{ marginBottom: 8 }}
        />
        <Button type="primary" block onClick={handleRoute}>
          Get Directions
        </Button>
        {distance && duration && (
          <Card style={{ marginTop: 16 }}>
            <p>Distance: {distance}</p>
            <p>Duration: {duration}</p>
          </Card>
        )}
      </div>
      <div style={{ flex: 1 }}>
        <Map
          center={mapCenter}
          zoom={13}
          style={{ width: "100%", height: "100%" }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
            />
          )}
        </Map>
      </div>
    </div>
  );
};

export default RouterGenerator;
