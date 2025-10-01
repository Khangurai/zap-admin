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
import { Button, Card, Tooltip, Row, Col, Statistic, Switch } from "antd";
import {
  Navigation,
  MapPin,
  Save,
  XCircle,
  Copy,  
  Check,
  Milestone,
  Clock,
  Users,
} from "lucide-react";
import PlaceAutocomplete from "./PlaceAutocomplete";
import { DraggableWaypoint } from "../markers/DraggableWaypoint";
import { WaypointOverlay } from "../markers/WaypointOverlay";
import copy from "copy-to-clipboard";
import StarsCanvas from "../../starBackground";
import MarkersReloadButton from "../markers/MarkersReloadButton";
import WaypointMultiSelect from "./WaypointMultiSelect";

interface ControlsProps {
  handleOriginSelect: (place: google.maps.places.PlaceResult | null) => void;
  handleDestinationSelect: (
    place: google.maps.places.PlaceResult | null
  ) => void;
  handleWaypointSelect: (place: google.maps.places.PlaceResult | null) => void;
  handleWaypointsSelect: (places: google.maps.places.PlaceResult[]) => void;
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
  onReloadMarkers: () => void;
  optimizeWaypoints: boolean;
  setOptimizeWaypoints: (value: boolean) => void;
}

const Controls = ({
  handleOriginSelect,
  handleDestinationSelect,
  handleWaypointSelect,
  handleWaypointsSelect,
  reorderWaypoints,
  removeWaypoint,
  fetchDirections,
  saveRoute,
  clearRoute,
  origin,
  destination,
  waypoints = [],
  totalDistance,
  totalDuration,
  directions,
  onReloadMarkers,
  optimizeWaypoints,
  setOptimizeWaypoints,
}: ControlsProps) => {
  const map = useMap();
  const [activeId, setActiveId] = useState<string | null>(null);

  const sensors = useSensors(
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

  const handleClearRoute = () => {
    clearRoute(); // This will reset origin, destination, waypoints, and optimizeWaypoints
  };

  return (
    <>
      <MapControl position={ControlPosition.LEFT_TOP}>
        <div
          style={{
            position: "relative",
            width: "100%",
            maxWidth: "500px",
            margin: "16px",
          }}
        >
          <div style={{ position: "absolute", inset: 0, zIndex: 0 }}>
            <StarsCanvas />
          </div>

          <Card
            size="small"
            style={{
              width: "80%",
              maxWidth: "600px",
              marginLeft: "0",
              padding: "16px",
              borderRadius: "16px",
              background: "rgba(255, 255, 255, 0.75)",
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
              style={{ display: "flex", flexDirection: "column", gap: "16px" }}
            >
              {/* old version */}
              {/* Waypoints*/}
              {/* <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#444",
                    marginBottom: "4px",
                    display: "flex",
                  }}
                >
                  Waypoints [{waypoints.length}] 
                </label>
                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    paddingRight: "8px",
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
                    <DragOverlay adjustScale={false}>
                      {activeWaypoint && (
                        <div style={{ transform: "translate(-50%, -50%)" }}>
                          <WaypointOverlay
                            waypoint={activeWaypoint}
                            index={activeIndex}
                          />
                        </div>
                      )}
                    </DragOverlay>
                  </DndContext>
                </div>
              </div> */}

              {/* Waypoints */}
              <div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "4px",
                  }}
                >
                  <label
                    style={{
                      fontWeight: 600,
                      fontSize: "13px",
                      color: "#444",
                      display: "flex",
                    }}
                  >
                    Waypoints [{waypoints.length}]
                  </label>

                  {/* Optimize Waypoints Toggle */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                    }}
                  >
                    <label
                      style={{
                        fontWeight: 600,
                        fontSize: "13px",
                        color: "#444",
                      }}
                    >
                      {optimizeWaypoints
                        ? "Optimize Waypoints"
                        : "Waypoints as Ordered"}
                    </label>
                    <Switch
                      checked={optimizeWaypoints}
                      onChange={(checked) => {
                        setOptimizeWaypoints(checked);
                        fetchDirections();
                      }}
                      disabled={!waypoints.length}
                    />
                  </div>
                </div>

                <div
                  style={{
                    maxHeight: "180px",
                    overflowY: "auto",
                    paddingRight: "8px",
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

                    <DragOverlay adjustScale={false}>
                      {activeWaypoint && (
                        <div style={{ transform: "translate(-50%, -50%)" }}>
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

              <WaypointMultiSelect
                onUsersSelect={handleWaypointsSelect}
                waypoints={waypoints}
              />

              {/* Origin */}
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#444",
                    marginBottom: "4px",
                    display: "flex",
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

              {/* Destination */}
              <div>
                <label
                  style={{
                    fontWeight: 600,
                    fontSize: "13px",
                    color: "#444",
                    marginBottom: "4px",
                    display: "flex",
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

              {/* Buttons */}
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  icon={<Milestone size={16} />}
                  onClick={fetchDirections}
                  disabled={!origin || !destination}
                  style={{
                    flex: 1,
                    minWidth: "100px",
                    background: "linear-gradient(90deg, #1890ff, #3875f6)",
                    color: "#fff",
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  Calculate
                </Button>
                <Button
                  icon={<Save size={16} />}
                  onClick={saveRoute}
                  disabled={!directions}
                  style={{
                    flex: 1,
                    minWidth: "100px",
                    background: "linear-gradient(90deg, #64ffda, #00c6ff)",
                    color: "#000",
                    fontWeight: 600,
                    border: "none",
                  }}
                >
                  Save Route
                </Button>
                <Button
                  danger
                  icon={<XCircle size={16} />}
                  onClick={handleClearRoute}
                  disabled={!directions}
                  style={{ flex: 1, minWidth: "100px" }}
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
                    backgroundColor: "rgba(245,247,250,0.9)",
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
            </div>
          </Card>
        </div>
      </MapControl>

      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "10px",
            margin: "10px",
            alignItems: "flex-end",
          }}
        >
          <MarkersReloadButton onReload={onReloadMarkers} />

          <Button
            icon={<Navigation size={16} />}
            onClick={centerOnYangon}
            style={{
              background: "rgba(255, 255, 255, 0.68)",
              border: "1px solid #ddd",
              borderRadius: "8px",
              boxShadow: "0 4px 10px rgba(0, 0, 0, 0.15)",
              backdropFilter: "blur(10px)",
              height: "40px",
              padding: "0 12px",
              display: "flex",
              alignItems: "center",
              fontSize: "14px",
              fontWeight: 500,
              color: "#1f2937",
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
