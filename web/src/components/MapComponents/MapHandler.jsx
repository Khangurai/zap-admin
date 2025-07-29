import { useEffect } from "react";
import { useMap } from "@vis.gl/react-google-maps";

const MapHandler = ({ origin, destination, waypoints }) => {
  const map = useMap();

  useEffect(() => {
    if (!map) return;

    // clear old markers
    if (!window._markers) window._markers = [];
    window._markers.forEach(marker => marker.setMap(null));
    window._markers = [];

    const addMarker = (pos, title) => {
      if (!pos) return;
      const marker = new window.google.maps.Marker({ position: pos, map, title });
      window._markers.push(marker);
    };

    if (origin?.geometry?.location) {
      addMarker(origin.geometry.location, "Origin");
      map.setCenter(origin.geometry.location);
    }
    waypoints.forEach((wp, i) => {
      if (wp?.geometry?.location) {
        addMarker(wp.geometry.location, `Waypoint ${i + 1}`);
      }
    });
    if (destination?.geometry?.location) {
      addMarker(destination.geometry.location, "Destination");
    }
  }, [map, origin, destination, waypoints]);

  return null;
};

export default MapHandler;
