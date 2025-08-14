import React, { useState } from "react";
import {
  APIProvider,
  AdvancedMarker,
  InfoWindow,
  ControlPosition,
  MapControl,
} from "@vis.gl/react-google-maps";
import { WaypointMarker } from "./markers/WaypointMarker";
import { MapPin, Navigation } from "lucide-react";
import Controls from "./controls/Controls";
import { useMapState } from "../../hooks/useMapState";
import SrcMap from "./SrcMap";
import UserMarkers from "./markers/UserMarkers";
import MarkersReloadButton from "./markers/MarkersReloadButton";

const API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const MapComponent = () => (
  <APIProvider apiKey={API_KEY}>
    <MapRoot />
  </APIProvider>
);

const MapRoot = () => {
  const mapState = useMapState();

  return (
    <SrcMap
      onMapClick={() => {
        mapState.handleOriginInfoWindowClose();
        mapState.handleDestinationInfoWindowClose();
        mapState.handleWaypointInfoWindowClose();
      }}
    >
      <WrappedMap {...mapState} />
    </SrcMap>
  );
};

const OriginMarkerContent = () => (
  <div
    style={{
      backgroundColor: "#1890ff",
      border: "3px solid white",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      cursor: "pointer",
    }}
  >
    <MapPin size={12} color="white" />
  </div>
);

const DestinationMarkerContent = () => (
  <div
    style={{
      backgroundColor: "#52c41a",
      border: "3px solid white",
      borderRadius: "50%",
      width: "24px",
      height: "24px",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
      cursor: "pointer",
    }}
  >
    <Navigation size={12} color="white" />
  </div>
);

const WrappedMap = (props: ReturnType<typeof useMapState>) => {
  const {
    origin,
    destination,
    waypoints,
    directions,
    totalDistance,
    totalDuration,
    originMarkerRef,
    destinationMarkerRef,
    originMarker,
    destinationMarker,
    originInfowindowShown,
    destinationInfowindowShown,
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
    saveRouteAsGeoJSON,
    clearRoute,
    optimizeWaypoints, // New prop
    setOptimizeWaypoints, // New prop
  } = props;

  const [reloadKey, setReloadKey] = useState(0);

  const handleReloadMarkers = () => {
    setReloadKey((prev) => prev + 1);
  };

  return (
    <>
      <Controls
        handleOriginSelect={handleOriginSelect}
        handleDestinationSelect={handleDestinationSelect}
        handleWaypointSelect={handleWaypointSelect}
        reorderWaypoints={reorderWaypoints}
        removeWaypoint={removeWaypoint}
        fetchDirections={fetchDirections}
        origin={origin}
        destination={destination}
        waypoints={waypoints}
        totalDistance={totalDistance}
        totalDuration={totalDuration}
        directions={directions}
        saveRoute={saveRouteAsGeoJSON}
        clearRoute={clearRoute}
        savedRouteGeoJSON={savedRouteGeoJSON}
        onReloadMarkers={handleReloadMarkers}
        optimizeWaypoints={optimizeWaypoints} // Pass new prop
        setOptimizeWaypoints={setOptimizeWaypoints} // Pass new prop
      />

      {origin && (
        <AdvancedMarker
          ref={originMarkerRef}
          position={origin.geometry?.location}
          onClick={handleOriginMarkerClick}
          gmpDraggable={true}
          onDragEnd={(e) => e.latLng && updateOriginPosition(e.latLng)}
        >
          <OriginMarkerContent />
        </AdvancedMarker>
      )}

      {destination && (
        <AdvancedMarker
          ref={destinationMarkerRef}
          position={destination.geometry?.location}
          onClick={handleDestinationMarkerClick}
          gmpDraggable={true}
          onDragEnd={(e) => e.latLng && updateDestinationPosition(e.latLng)}
        >
          <DestinationMarkerContent />
        </AdvancedMarker>
      )}

      {originInfowindowShown && origin && (
        <InfoWindow
          anchor={originMarker}
          onCloseClick={handleOriginInfoWindowClose}
          headerDisabled
        >
          <div
            style={{
              padding: "8px",
              maxWidth: "200px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#1890ff",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <MapPin size={10} color="white" />
              </div>
              <strong style={{ color: "#1890ff", fontSize: "14px" }}>
                Origin
              </strong>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {origin.name}
            </div>
            <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
              {origin.formatted_address}
            </div>
          </div>
        </InfoWindow>
      )}

      {waypoints.map((waypoint, index) => (
        <WaypointMarker
          key={waypoint.id}
          waypoint={waypoint}
          index={index}
          isInfoWindowVisible={!!waypointInfowindows[waypoint.id]}
          onMarkerClick={handleWaypointMarkerClick}
          onInfoWindowClose={handleWaypointInfoWindowClose}
          onWaypointDragEnd={updateWaypointPosition}
        />
      ))}

      {destinationInfowindowShown && destination && (
        <InfoWindow
          anchor={destinationMarker}
          onCloseClick={handleDestinationInfoWindowClose}
          headerDisabled
        >
          <div
            style={{
              padding: "8px",
              maxWidth: "200px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "8px",
                marginBottom: "8px",
              }}
            >
              <div
                style={{
                  backgroundColor: "#52c41a",
                  borderRadius: "50%",
                  width: "16px",
                  height: "16px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Navigation size={10} color="white" />
              </div>
              <strong style={{ color: "#52c41a", fontSize: "14px" }}>
                Destination
              </strong>
            </div>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {destination.name}
            </div>
            <div style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}>
              {destination.formatted_address}
            </div>
          </div>
        </InfoWindow>
      )}

      <UserMarkers reloadKey={reloadKey} />
    </>
  );
};

export default MapComponent;