import React, { useState, useEffect } from "react";
import mbxStatic from "@mapbox/mapbox-sdk/services/static";

const MAPBOX_ACCESS_TOKEN = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

const StaticRouteMap = ({ geoJson }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!MAPBOX_ACCESS_TOKEN) {
      setError("Mapbox access token is not configured.");
      console.error("VITE_MAPBOX_ACCESS_TOKEN is not set.");
      return;
    }

    if (!geoJson) {
      return;
    }

    const staticImagesClient = mbxStatic({ accessToken: MAPBOX_ACCESS_TOKEN });

    const getStaticImage = async () => {
      try {
        const geoJsonOverlay = {
          geojson: geoJson,
          path: {
            strokeWidth: 3,
            strokeColor: "#ff0000",
            strokeOpacity: 0.8,
          },
        };

        const request = staticImagesClient.getStaticImage({
          ownerId: "mapbox",
          styleId: "streets-v11",
          width: 600,
          height: 300,
          position: "auto",
          overlays: [geoJsonOverlay],
        });

        setImageUrl(request.url());
      } catch (e) {
        console.error("Error generating static map image:", e);
        setError("Could not generate map image.");
      }
    };

    getStaticImage();
  }, [geoJson]);

  if (error) {
    return <div style={{ color: "red" }}>{error}</div>;
  }

  if (!imageUrl) {
    return <div>Loading map...</div>;
  }

  return (
    <img
      src={imageUrl}
      alt="Route map"
      style={{ width: "100%", borderRadius: "8px" }}
    />
  );
};

export default StaticRouteMap;
