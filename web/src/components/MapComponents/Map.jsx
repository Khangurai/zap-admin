import React, { useState, useEffect } from "react";
import { APIProvider, Map, useMap } from "@vis.gl/react-google-maps";

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
const Yangon = { lat: 16.8409, lng: 96.1735 };

const MapComponent = () => (
  <div
    style={{
      borderRadius: "10px",
      overflow: "hidden",
      height: "60vh",
      boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
    }}
  >
    <APIProvider apiKey={GOOGLE_MAPS_API_KEY} libraries={["places"]}>
      <Map
        style={{ width: "100%", height: "100%" }}
        defaultCenter={Yangon}
        gestureHandling={"greedy"}
        defaultZoom={13}
        disableDefaultUI={true}
        mapId="route-map"
      ></Map>
    </APIProvider>
  </div>
);

export default MapComponent;
