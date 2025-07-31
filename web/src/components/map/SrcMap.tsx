import React from "react";
import { Map, useGoogleMapsApi } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 16.8409, lng: 96.1735 };

const SrcMap = ({ children, onMapClick }) => {
  const googleMapsApi = useGoogleMapsApi();

  const mapTypeControlOptions = googleMapsApi
    ? {
        style: googleMapsApi.MapTypeControlStyle.HORIZONTAL_BAR,
        position: googleMapsApi.ControlPosition.RIGHT_TOP,
      }
    : undefined;
  return (
    <div
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        height: "60vh",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Map
        mapId="dc7c329c64dbcd9eb54601f5"
        defaultZoom={13}
        defaultCenter={DEFAULT_CENTER}
        gestureHandling="greedy"
        disableDefaultUI={true}
        mapTypeControl={true}
        mapTypeControlOptions={mapTypeControlOptions}
        fullscreenControl={true}
        onClick={onMapClick}
        style={{
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </Map>
    </div>
  );
};

export default SrcMap;
