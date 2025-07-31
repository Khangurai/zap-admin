import React from "react";
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";

interface WaypointMarkerProps {
  waypoint: google.maps.places.PlaceResult & { id: string };
  index: number;
  isInfoWindowVisible: boolean;
  onMarkerClick: (id: string) => void;
  onInfoWindowClose: (id: string) => void;
  onWaypointDragEnd: (id: string, newPosition: google.maps.LatLng) => void;
}

export const WaypointMarker: React.FC<WaypointMarkerProps> = ({
  waypoint,
  index,
  isInfoWindowVisible,
  onMarkerClick,
  onInfoWindowClose,
  onWaypointDragEnd,
}) => {
  const [markerRef, marker] = useAdvancedMarkerRef();

  const handleDragEnd = (e: google.maps.MapMouseEvent) => {
    if (e.latLng) {
      onWaypointDragEnd(waypoint.id, e.latLng);
    }
  };

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={waypoint.geometry?.location}
        onClick={() => onMarkerClick(waypoint.id)}
        gmpDraggable={true}
        onDragEnd={handleDragEnd}
      >
        <div
          style={{
            backgroundColor: "#faad14",
            border: "3px solid white",
            borderRadius: "50%",
            width: "24px",
            height: "24px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
            fontSize: "10px",
            fontWeight: "bold",
            color: "white",
          }}
        >
          {`W${index + 1}`}
        </div>
      </AdvancedMarker>

      {isInfoWindowVisible && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => onInfoWindowClose(waypoint.id)}
          headerDisabled
        >
          <div style={{ padding: "8px", maxWidth: "200px" }}>
            <strong
              style={{ color: "#faad14", fontSize: "14px" }}
            >{`Waypoint W${index + 1}`}</strong>
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {waypoint.name}
            </div>
            <div
              style={{ fontSize: "12px", color: "#666", lineHeight: "1.4" }}
            >
              {waypoint.formatted_address}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};
