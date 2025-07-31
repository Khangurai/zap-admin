import { useState, useEffect, useCallback } from "react";
import { useAdvancedMarkerRef, useMap } from "@vis.gl/react-google-maps";
import { arrayMove } from "@dnd-kit/sortable";
import { calculateDistance } from "../utils/geometry";
import { useDirections } from "./useDirections";

const DRAG_RADIUS_THRESHOLD = 52.75; // in meters

export const useMapState = () => {
  const [origin, setOrigin] = useState<google.maps.places.PlaceResult | null>(
    null
  );
  const [destination, setDestination] =
    useState<google.maps.places.PlaceResult | null>(null);
  const [waypoints, setWaypoints] = useState<
    (google.maps.places.PlaceResult & { id: string })[]
  >([]);

  const [originMarkerRef, originMarker] = useAdvancedMarkerRef();
  const [destinationMarkerRef, destinationMarker] = useAdvancedMarkerRef();

  const [originInfowindowShown, setOriginInfowindowShown] = useState(false);
  const [destinationInfowindowShown, setDestinationInfowindowShown] =
    useState(false);

  const {
    directions,
    travelMode,
    totalDistance,
    totalDuration,
    setTravelMode,
    fetchDirections,
    directionsRenderer,
    setDirections,
  } = useDirections(origin, destination, waypoints);

  const [savedRouteGeoJSON, setSavedRouteGeoJSON] = useState<string | null>(
    null
  );

  const map = useMap();
  const [geocoder, setGeocoder] = useState<google.maps.Geocoder | null>(null);

  useEffect(() => {
    if (!map) return;
    setGeocoder(new google.maps.Geocoder());
  }, [map]);
  
  useEffect(() => {
    if (!map) return;

    const hasOrigin = origin?.geometry?.location;
    const hasDestination = destination?.geometry?.location;

    if (hasOrigin && hasDestination) {
      const bounds = new google.maps.LatLngBounds();
      bounds.extend(origin.geometry.location);
      bounds.extend(destination.geometry.location);
      waypoints.forEach((waypoint) => {
        if (waypoint.geometry?.location) {
          bounds.extend(waypoint.geometry.location);
        }
      });
      map.fitBounds(bounds, 80);
    } else if (hasOrigin) {
      map.panTo(origin.geometry.location);
      map.setZoom(15);
    } else if (hasDestination) {
      map.panTo(destination.geometry.location);
      map.setZoom(15);
    }
  }, [origin, destination, waypoints, map]);

  const [waypointInfowindows, setWaypointInfowindows] = useState<{
    [id: string]: boolean;
  }>({});

  const handleOriginMarkerClick = () => {
    if (!origin?.geometry?.location || !map) return;
    map.panTo(origin.geometry.location);
    setOriginInfowindowShown((isShown) => !isShown);
  };

  const handleDestinationMarkerClick = () => {
    if (!destination?.geometry?.location || !map) return;
    map.panTo(destination.geometry.location);
    setDestinationInfowindowShown((isShown) => !isShown);
  };

  const handleOriginInfoWindowClose = () => {
    setOriginInfowindowShown(false);
  };

  const handleDestinationInfoWindowClose = () => {
    setDestinationInfowindowShown(false);
  };

  const handleWaypointMarkerClick = useCallback((id: string) => {
    setWaypointInfowindows(prev => {
      const isAlreadyOpen = prev[id];
      const newWaypointInfowindowsState = {}; // Close all
      if (!isAlreadyOpen) {
        newWaypointInfowindowsState[id] = true; // Open the clicked one
      }
      return newWaypointInfowindowsState;
    });
  }, []);
  const handleWaypointInfoWindowClose = (id?: string) => {
    if (id) {
      setWaypointInfowindows((prev) => ({
        ...prev,
        [id]: false,
      }));
    } else {
      setWaypointInfowindows({});
    }
  };

  const handleOriginSelect = (place: google.maps.places.PlaceResult | null) => {
    setOrigin(place);
    setOriginInfowindowShown(!!place);
  };

  const handleDestinationSelect = (
    place: google.maps.places.PlaceResult | null
  ) => {
    setDestination(place);
    setDestinationInfowindowShown(!!place);
  };

  const handleWaypointSelect = useCallback(
    (place: google.maps.places.PlaceResult | null) => {
      if (place?.geometry?.location) {
        const newWaypoint = { ...place, id: Date.now().toString() };
        setWaypoints((prev) => [...prev, newWaypoint]);
        map?.panTo(place.geometry.location);

        // Close all other info windows and open the new one
        setWaypointInfowindows({ [newWaypoint.id]: true });
        setOriginInfowindowShown(false);
        setDestinationInfowindowShown(false);
      }
    },
    [map]
  );

  const reorderWaypoints = (activeId: string, overId: string) => {
    setWaypoints((items) => {
      const oldIndex = items.findIndex((item) => item.id === activeId);
      const newIndex = items.findIndex((item) => item.id === overId);
      return arrayMove(items, oldIndex, newIndex);
    });
  };

  const removeWaypoint = (id: string) => {
    setWaypoints(waypoints.filter((w) => w.id !== id));
  };

  const updateWaypointPosition = (
    id: string,
    newPosition: google.maps.LatLng
  ) => {
    if (!geocoder) return;

    const waypoint = waypoints.find((w) => w.id === id);
    if (!waypoint?.geometry?.location) return;

    const distance = calculateDistance(
      waypoint.geometry.location.lat(),
      waypoint.geometry.location.lng(),
      newPosition.lat(),
      newPosition.lng()
    );

    if (distance > DRAG_RADIUS_THRESHOLD) {
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const newPlace = results[0];
          setWaypoints((prevWaypoints) =>
            prevWaypoints.map((w) => {
              if (w.id === id) {
                return {
                  ...newPlace,
                  id: w.id,
                  geometry: {
                    location: newPosition,
                  },
                };
              }
              return w;
            })
          );
        } else {
          console.error(`Geocoder failed due to: ${status}`);
        }
      });
    } else {
      setWaypoints((prevWaypoints) =>
        prevWaypoints.map((w) => {
          if (w.id === id) {
            return {
              ...w,
              geometry: {
                ...w.geometry,
                location: newPosition,
              },
            };
          }
          return w;
        })
      );
    }
  };

  const updateOriginPosition = (newPosition: google.maps.LatLng) => {
    if (!geocoder || !origin?.geometry?.location) return;

    const distance = calculateDistance(
      origin.geometry.location.lat(),
      origin.geometry.location.lng(),
      newPosition.lat(),
      newPosition.lng()
    );

    if (distance > DRAG_RADIUS_THRESHOLD) {
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const newPlace = results[0];
          setOrigin({
            ...newPlace,
            geometry: {
              location: newPosition,
            },
          });
        } else {
          console.error(`Geocoder failed due to: ${status}`);
        }
      });
    } else {
      setOrigin((prevOrigin) => ({
        ...prevOrigin,
        geometry: {
          ...prevOrigin.geometry,
          location: newPosition,
        },
      }));
    }
  };

  const updateDestinationPosition = (newPosition: google.maps.LatLng) => {
    if (!geocoder || !destination?.geometry?.location) return;

    const distance = calculateDistance(
      destination.geometry.location.lat(),
      destination.geometry.location.lng(),
      newPosition.lat(),
      newPosition.lng()
    );

    if (distance > DRAG_RADIUS_THRESHOLD) {
      geocoder.geocode({ location: newPosition }, (results, status) => {
        if (status === "OK" && results && results[0]) {
          const newPlace = results[0];
          setDestination({
            ...newPlace,
            geometry: {
              location: newPosition,
            },
          });
        } else {
          console.error(`Geocoder failed due to: ${status}`);
        }
      });
    } else {
      setDestination((prevDestination) => ({
        ...prevDestination,
        geometry: {
          ...prevDestination.geometry,
          location: newPosition,
        },
      }));
    }
  };

  const saveRouteAsGeoJSON = () => {
    if (!directions || !directions.routes[0]) return;

    const route = directions.routes[0];
    const coordinates = route.overview_path.map((p) => [p.lng(), p.lat()]);

    const geoJson = {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          properties: {},
          geometry: {
            type: "LineString",
            coordinates: coordinates,
          },
        },
      ],
    };

    setSavedRouteGeoJSON(JSON.stringify(geoJson, null, 2));
  };

  const clearRoute = () => {
    setOrigin(null);
    setDestination(null);
    setWaypoints([]);
    setDirections(null);
    setSavedRouteGeoJSON(null);
    if (directionsRenderer) {
      directionsRenderer.setDirections({ routes: [] });
    }
  };

  return {
    origin,
    destination,
    waypoints,
    originMarkerRef,
    destinationMarkerRef,
    originMarker,
    destinationMarker,
    originInfowindowShown,
    destinationInfowindowShown,
    directions,
    travelMode,
    totalDistance,
    totalDuration,
    savedRouteGeoJSON,
    waypointInfowindows,
    handleWaypointMarkerClick,
    handleWaypointInfoWindowClose,
    handleOriginMarkerClick,
    handleDestinationMarkerClick,
    handleOriginInfoWindowClose,
    handleDestinationInfoWindowClose,
    handleOriginSelect,
    handleDestinationSelect,
    handleWaypointSelect,
    reorderWaypoints,
    removeWaypoint,
    updateWaypointPosition,
    updateOriginPosition,
    updateDestinationPosition,
    fetchDirections,
    setTravelMode,
    saveRouteAsGeoJSON,
    clearRoute,
  };
};

