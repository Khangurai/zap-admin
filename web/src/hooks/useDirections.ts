import { useState, useEffect, useCallback } from "react";
import { useMap } from "@vis.gl/react-google-maps";

export const useDirections = (
  origin: google.maps.places.PlaceResult | null,
  destination: google.maps.places.PlaceResult | null,
  waypoints: (google.maps.places.PlaceResult & { id: string })[]
) => {
  const map = useMap();
  const [directions, setDirections] =
    useState<google.maps.DirectionsResult | null>(null);
  const [travelMode, setTravelMode] =
    useState<google.maps.TravelMode>("DRIVING");
  const [totalDistance, setTotalDistance] = useState<string | null>(null);
  const [totalDuration, setTotalDuration] = useState<string | null>(null);
  const [directionsService, setDirectionsService] =
    useState<google.maps.DirectionsService | null>(null);
  const [directionsRenderer, setDirectionsRenderer] =
    useState<google.maps.DirectionsRenderer | null>(null);
  const [optimizeWaypoints, setOptimizeWaypoints] = useState(true); // New state for toggling optimization
  const [waypointOrder, setWaypointOrder] = useState<number[]>([]); // Store optimized order

  const computeRouteDetails = (result: google.maps.DirectionsResult) => {
    let totalDistance = 0;
    let totalDuration = 0;
    const myroute = result.routes[0];

    if (!myroute) {
      return;
    }

    for (let i = 0; i < myroute.legs.length; i++) {
      totalDistance += myroute.legs[i].distance.value;
      totalDuration += myroute.legs[i].duration.value;
    }

    setTotalDistance((totalDistance / 1000).toFixed(2) + " km");
    setTotalDuration((totalDuration / 60).toFixed(2) + " min");
    setWaypointOrder(myroute.waypoint_order || []); // Store optimized order
  };

  useEffect(() => {
    if (directions) {
      computeRouteDetails(directions);
    } else {
      setTotalDistance(null);
      setTotalDuration(null);
      setWaypointOrder([]);
    }
  }, [directions]);

  useEffect(() => {
    if (!map) return;
    setDirectionsService(new google.maps.DirectionsService());
    setDirectionsRenderer(
      new google.maps.DirectionsRenderer({
        draggable: true,
        suppressMarkers: true,
        map,
        polylineOptions: {
          strokeColor: "#FF0000",
          strokeOpacity: 0.8,
          strokeWeight: 5,
        },
      })
    );
  }, [map]);

  useEffect(() => {
    if (!directionsRenderer) return;
    const listener = directionsRenderer.addListener(
      "directions_changed",
      () => {
        const newDirections = directionsRenderer.getDirections();
        if (newDirections) {
          setDirections(newDirections);
        }
      }
    );
    return () => {
      listener.remove();
    };
  }, [directionsRenderer]);

  const fetchDirections = useCallback(() => {
    if (!origin || !destination || !directionsService || !directionsRenderer)
      return;

    const request: google.maps.DirectionsRequest = {
      origin: origin.geometry.location,
      destination: destination.geometry.location,
      travelMode,
      waypoints: waypoints.map((waypoint) => ({
        location: waypoint.geometry.location,
        stopover: true,
      })),
      optimizeWaypoints, // Use the state variable
    };

    directionsService.route(request, (response, status) => {
      if (status === "OK") {
        directionsRenderer.setDirections(response);
        setDirections(response);
      } else {
        console.error(`Directions request failed due to ${status}`);
      }
    });
  }, [
    origin,
    destination,
    waypoints,
    travelMode,
    directionsService,
    directionsRenderer,
    optimizeWaypoints,
  ]);

  return {
    directions,
    travelMode,
    totalDistance,
    totalDuration,
    setTravelMode,
    fetchDirections,
    directionsRenderer,
    setDirections,
    optimizeWaypoints,
    setOptimizeWaypoints,
    waypointOrder, // Return optimized order
  };
};