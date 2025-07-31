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
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import {
  Button,
  Card,
  Tag,
  Input,
  Space,
  Tooltip,
  Row,
  Col,
  Statistic,
} from "antd";
import {
  Navigation,
  MapPin,
  Plus,
  Trash2,
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
  fetchDirections,
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
  const [activeId, setActiveId] = useState(null);
  const [isCopied, setIsCopied] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const centerOnYangon = () => {
    if (map) {
      map.setCenter({ lat: 16.82124587814855, lng: 96.16615130703836 });
      map.setZoom(12);
    }
  };

  const handleDragStart = (event) => {
    const { active } = event;
    setActiveId(active.id);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;

    if (active.id !== over?.id && over?.id) {
      reorderWaypoints(active.id, over.id);
    }

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

    // Fallback for non-secure contexts
    const fallbackCopyToClipboard = (text: string) => {
      const textArea = document.createElement("textarea");
      textArea.value = text;

      // Avoid scrolling to bottom
      textArea.style.top = "0";
      textArea.style.left = "0";
      textArea.style.position = "fixed";

      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      try {
        const successful = document.execCommand("copy");
        if (successful) {
          setIsCopied(true);
          setTimeout(() => setIsCopied(false), 2000);
        }
      } catch (err) {
        console.error("Fallback: Oops, unable to copy", err);
      }

      document.body.removeChild(textArea);
    };

    if (!navigator.clipboard) {
      fallbackCopyToClipboard(savedRouteGeoJSON);
      return;
    }

    navigator.clipboard.writeText(savedRouteGeoJSON).then(
      () => {
        setIsCopied(true);
        setTimeout(() => setIsCopied(false), 2000);
      },
      (err) => {
        console.error("Async: Could not copy text: ", err);
        fallbackCopyToClipboard(savedRouteGeoJSON);
      }
    );
  };

  return (
    <>
      <MapControl position={ControlPosition.LEFT_TOP}>
        <Card
          size="small"
          style={{
            width: "380px",
            margin: "16px",
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
            borderRadius: "8px",
          }}
          title={
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <MapPin size={18} />
              Route Planner
            </div>
          }
        >
          <div
            style={{ display: "flex", flexDirection: "column", gap: "12px" }}
          >
            <div>
              <label
                style={{
                  display: "flex",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                From
              </label>
              <PlaceAutocomplete
                onPlaceSelect={handleOriginSelect}
                place={origin}
                placeholder="Origin"
              />
            </div>

            <div>
              <label
                style={{
                  display: "flex",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                Waypoints ({waypoints.length})
              </label>
              <div
                style={{
                  maxHeight: "200px",
                  overflowY: "auto",
                  paddingRight: "10px",
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

                  <DragOverlay>
                    {activeWaypoint && (
                      <WaypointOverlay
                        waypoint={activeWaypoint}
                        index={activeIndex}
                      />
                    )}
                  </DragOverlay>
                </DndContext>
              </div>
            </div>
            <div>
              <PlaceAutocomplete
                onPlaceSelect={handleWaypointSelect}
                place={null}
                placeholder="Add a waypoint"
              />
            </div>
            <div>
              <label
                style={{
                  display: "flex",
                  marginBottom: "4px",
                  fontWeight: "500",
                  fontSize: "14px",
                  color: "#666",
                }}
              >
                To
              </label>
              <PlaceAutocomplete
                onPlaceSelect={handleDestinationSelect}
                place={destination}
                placeholder="Destination"
              />
            </div>

            {/* <Button
              type="primary"
              icon={<Navigation size={16} />}
              onClick={fetchDirections}
              disabled={!origin || !destination}
            >
              Get Directions
            </Button> */}
            <div style={{ display: "flex", gap: "8px" }}>
              <Button
                icon={<Save size={16} />}
                onClick={saveRoute}
                disabled={!directions}
                style={{ flex: 1 }}
              >
                Save Route
              </Button>
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
            {(totalDistance || totalDuration) && (
              <div
                style={{
                  marginTop: "12px",
                  padding: "12px",
                  backgroundColor: "#fafafa",
                  borderRadius: "8px",
                  border: "1px solid #f0f0f0",
                }}
              >
                <Row gutter={16}>
                  <Col span={12}>
                    <Statistic
                      title="Total Distance"
                      value={totalDistance || "0 km"}
                      precision={2}
                      prefix={<Milestone size={16} />}
                      valueStyle={{ fontSize: "16px", color: "#cf1322" }}
                    />
                  </Col>
                  <Col span={12}>
                    <Statistic
                      title="Total Duration"
                      value={totalDuration || "0 min"}
                      precision={2}
                      prefix={<Clock size={16} />}
                      valueStyle={{ fontSize: "16px", color: "#cf1322" }}
                    />
                  </Col>
                </Row>
              </div>
            )}
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
                  <h3 style={{ margin: 0 }}>Saved Route (GeoJSON)</h3>
                  <Tooltip title={isCopied ? "Copied!" : "Copy"}>
                    <Button
                      icon={isCopied ? <Check size={16} /> : <Copy size={16} />}
                      onClick={copyToClipboard}
                    />
                  </Tooltip>
                </div>
                <pre
                  style={{
                    padding: "10px",
                    background: "#fafafa",
                    border: "1px solid #e8e8e8",
                    borderRadius: "4px",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-all",
                    maxHeight: "200px",
                    overflowY: "auto",
                  }}
                >
                  {savedRouteGeoJSON}
                </pre>
              </div>
            )}
          </div>
        </Card>
      </MapControl>

      <MapControl position={ControlPosition.RIGHT_BOTTOM}>
        <div style={{ margin: "16px" }}>
          <Button
            type="default"
            icon={<Navigation size={16} />}
            onClick={centerOnYangon}
            style={{
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.15)",
              borderRadius: "6px",
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
