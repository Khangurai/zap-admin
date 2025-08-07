"use client";

import React, { useState } from "react";
import { ControlPosition, MapControl, useMap } from "@vis.gl/react-google-maps";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragOverlay,
} from "@dnd-kit/core";
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { Button, Card, Tooltip, Row, Col, Statistic } from "antd";
import {
  Navigation,
  MapPin,
  Save,
  XCircle,
  Copy,
  Check,
  Milestone,
  Clock,
} from "lucide-react";
import PlaceAutocomplete from "./PlaceAutocomplete";
import { DraggableWaypoint } from "../markers/DraggableWaypoint";
import { WaypointOverlay } from "../markers/WaypointOverlay";
import StarsCanvas from "../../starBackground"; // ✅ Import StarsCanvas

interface ControlsProps {
  handleOriginSelect: (place: google.maps.places.PlaceResult | null) => void;
  handleDestinationSelect: (
    place: google.maps.places.PlaceResult | null
  ) => void;
  handleWaypointSelect: (place: google.maps.places.PlaceResult | null) => void;
  reorderWaypoints: (oldIndex: number, newIndex: number) => void;
  removeWaypoint: (id: string) => void;
  fetchDirections: () => void;
  saveRoute: () => void;
  clearRoute: () => void;
  origin: google.maps.places.PlaceResult | null;
  destination: google.maps.places.PlaceResult | null;
  waypoints: (google.maps.places.PlaceResult & { id: string })[];
  totalDistance: string | null;
  totalDuration: string | null;
  directions: google.maps.DirectionsResult | null;
  savedRouteGeoJSON: string | null;
}

const Controls = ({
  handleOriginSelect,
  handleDestinationSelect,
  handleWaypointSelect,
  reorderWaypoints,
  removeWaypoint,
  saveRoute,
  clearRoute,
  origin,
  destination,
  waypoints = [],
  totalDistance,
  totalDuration,
  directions,
  savedRouteGeoJSON,
}: ControlsProps) => {
  const map = useMap();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);

  const sensors = useSensors(
    // useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const centerOnYangon = () => {
    if (map) {
      map.setCenter({ lat: 16.82124587814855, lng: 96.16615130703836 });
      map.setZoom(12);
    }
  };

  const handleDragStart = (event: any) => setActiveId(event.active.id);
  const handleDragEnd = (event: any) => {
    const { active, over } = event;
    if (active.id !== over?.id && over?.id)
      reorderWaypoints(active.id, over.id);
    setActiveId(null);
  };

  const activeWaypoint = activeId
    ? waypoints.find((w) => w.id === activeId)
    : null;
  const activeIndex = activeWaypoint
    ? waypoints.findIndex((w) => w.id === activeId)
    : -1;

  const copyToClipboard = () => {
    if (!savedRouteGeoJSON) return;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(savedRouteGeoJSON).then(() => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      });
    }
  };

  return (
    <>
      {/* Route Planner Card */}
      <MapControl position={ControlPosition.LEFT_TOP}>
        <div style={{ position: "relative", width: "400px", margin: "16px" }}>
          {/* StarsCanvas as background */}
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <StarsCanvas />
          </div>

          {/* Card Content */}
          <Card
            size="small"
            style={{
              width: "320px",
              padding: "5px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.74)",
              backdropFilter: "blur(10px)",
              border: "1px solid rgba(200, 200, 200, 0.2)",
              boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
              position: "relative",
              zIndex: 1,
              overflow: "hidden",
            }}
            title={
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "8px",
                  fontWeight: 600,
                }}
              >
                <MapPin size={18} /> Route Planner
              </div>
            }
          >
            <div
              style={{ display: "flex", flexDirection: "column", gap: "14px" }}
            >
              {/* Origin */}
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    marginBottom: "4px",
                    display: "flex",
                    color: "#444",
                  }}
                >
                  Origin
                </label>
                <PlaceAutocomplete
                  onPlaceSelect={handleOriginSelect}
                  place={origin}
                  placeholder="Enter origin"
                />
              </div>

              {/* Waypoints */}
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    marginBottom: 0,
                    display: "flex",
                    color: "#444",
                  }}
                >
                  Waypoints [{waypoints.length}]
                </label>
                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    paddingRight: "8px",
                    position: "relative",
                  }}
                >
                  <DndContext
                    sensors={sensors}
                    collisionDetection={closestCenter}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                  >
                    <SortableContext
                      items={waypoints.map((w) => w.id)}
                      strategy={verticalListSortingStrategy}
                    >
                      {waypoints.map((waypoint, index) => (
                        <DraggableWaypoint
                          key={waypoint.id}
                          waypoint={waypoint}
                          index={index}
                          onDelete={removeWaypoint}
                        />
                      ))}
                    </SortableContext>
                    {/* <DragOverlay>
                      {activeWaypoint && (
                        <WaypointOverlay
                          waypoint={activeWaypoint}
                          index={activeIndex}
                        />
                      )}
                    </DragOverlay> */}
                    <DragOverlay adjustScale={false}>
                      {activeWaypoint && (
                        <div
                          style={{
                            transform: "translate(-80%, -70%)",
                          }}
                        >
                          <WaypointOverlay
                            waypoint={activeWaypoint}
                            index={activeIndex}
                          />
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                </div>
              </div>

              <PlaceAutocomplete
                onPlaceSelect={handleWaypointSelect}
                place={null}
                placeholder="Add waypoint"
              />

              {/* Destination */}
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    marginBottom: "4px",
                    display: "flex",
                    color: "#444",
                  }}
                >
                  Destination
                </label>
                <PlaceAutocomplete
                  onPlaceSelect={handleDestinationSelect}
                  place={destination}
                  placeholder="Enter destination"
                />
              </div>

              {/* Actions */}
              <div style={{ display: "flex", gap: "10px" }}>
                <Tooltip
                  title={
                    !origin || !destination
                      ? "Please add origin & destination"
                      : ""
                  }
                >
                  <Button
                    icon={<Save size={16} />}
                    onClick={saveRoute}
                    disabled={!directions}
                    style={{
                      flex: 1,
                      background: "linear-gradient(90deg, #64ffda, #00c6ff)",
                      color: "#000",
                      fontWeight: 600,
                      border: "none",
                    }}
                  >
                    Save Route
                  </Button>
                </Tooltip>
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  onClick={clearRoute}
                  disabled={!directions}
                  style={{ flex: 1 }}
                >
                  Clear Route
                </Button>
              </div>

              {/* Distance & Duration */}
              {(totalDistance || totalDuration) && (
                <div
                  style={{
                    marginTop: "12px",
                    padding: "12px",
                    backgroundColor: "rgba(245, 247, 250, 0.9)",
                    borderRadius: "12px",
                    border: "1px solid #e0e0e0",
                  }}
                >
                  <Row gutter={16}>
                    <Col span={12}>
                      <Statistic
                        title="Distance"
                        value={totalDistance || "0 km"}
                        prefix={<Milestone size={16} />}
                        valueStyle={{ fontSize: "16px", color: "#1890ff" }}
                      />
                    </Col>
                    <Col span={12}>
                      <Statistic
                        title="Duration"
                        value={totalDuration || "0 min"}
                        prefix={<Clock size={16} />}
                        valueStyle={{ fontSize: "16px", color: "#1890ff" }}
                      />
                    </Col>
                  </Row>
                </div>
              )}

              {/* GeoJSON */}
              {savedRouteGeoJSON && (
                <div style={{ marginTop: "12px" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      marginBottom: "8px",
                    }}
                  >
                    <h3 style={{ margin: 0, fontSize: "14px" }}>
                      Saved Route (GeoJSON)
                    </h3>
                    <Tooltip title={isCopied ? "Copied!" : "Copy"}>
                      <Button
                        icon={
                          isCopied ? <Check size={16} /> : <Copy size={16} />
                        }
                        onClick={copyToClipboard}
                      />
                    </Tooltip>
                  </div>
                  <pre
                    style={{
                      padding: "10px",
                      background: "#f8f9fa",
                      border: "1px solid #e8e8e8",
                      borderRadius: "8px",
                      fontSize: "12px",
                      whiteSpace: "pre-wrap",
                      maxHeight: "180px",
                      overflowY: "auto",
                    }}
                  >
                    {savedRouteGeoJSON}
                  </pre>
                </div>
              )}
            </div>
          </Card>
        </div>
      </MapControl>

      {/* Center Button */}
      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <div style={{ margin: "16px" }}>
          <Button
            icon={<Navigation size={16} />}
            onClick={centerOnYangon}
            style={{
              background: "rgba(255, 255, 255, 0.68)",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0,0,0,0.15)",
              backdropFilter: "blur(10px)",
            }}
          >
            Center on Yangon
          </Button>
        </div>
      </MapControl>
    </>
  );
};

export default Controls;
