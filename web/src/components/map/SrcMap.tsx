import React, { useEffect, useState } from "react";
import { Map, useMap } from "@vis.gl/react-google-maps";

const DEFAULT_CENTER = { lat: 16.8409, lng: 96.1735 };

const SrcMap = ({ children, onMapClick }) => {
  const map = useMap();
  const [mapTypeControlOptions, setMapTypeControlOptions] = useState(undefined);
  const [fullscreenControlOptions, setFullscreenControlOptions] = useState(undefined);

  useEffect(() => {
    if (map) {
      setMapTypeControlOptions({
        style: window.google.maps.MapTypeControlStyle.HORIZONTAL_BAR,
        position: window.google.maps.ControlPosition.TOP_CENTER,
      });
      setFullscreenControlOptions({
        position: window.google.maps.ControlPosition.RIGHT_TOP,
      });
    }
  }, [map]);

  return (
    <div
      style={{
        borderRadius: "10px",
        overflow: "hidden",
        height: "75vh",
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
        fullscreenControlOptions={fullscreenControlOptions}
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