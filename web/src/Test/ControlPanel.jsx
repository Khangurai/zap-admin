import React from "react";
import { AutoComplete, Button, Space, Typography, message } from "antd";
import { Zap, Plus, Trash2 } from "lucide-react";
import { useMapsLibrary } from "@vis.gl/react-google-maps";

const { Text } = Typography;

const ControlPanel = ({
  origin,
  setOrigin,
  destination,
  setDestination,
  waypoints,
  setWaypoints,
  onCalculateRoute,
  distance,
  duration,
  onSetManualPin,
  manualPinMode,
}) => {
  const placesLibrary = useMapsLibrary("places");
  const [placesService, setPlacesService] = React.useState(null);
  const [predictions, setPredictions] = React.useState({
    origin: [],
    destination: [],
    waypoints: {},
  });

  React.useEffect(() => {
    if (!placesLibrary) return;
    const service = new placesLibrary.AutocompleteService();
    setPlacesService(service);
  }, [placesLibrary]);

  const getPlacePredictions = async (input, type, waypointKey = null) => {
    if (!placesService || !input) {
      if (type === "waypoint" && waypointKey) {
        setPredictions((prev) => ({
          ...prev,
          waypoints: { ...prev.waypoints, [waypointKey]: [] },
        }));
      } else {
        setPredictions((prev) => ({ ...prev, [type]: [] }));
      }
      return;
    }

    try {
      const request = {
        input,
        componentRestrictions: { country: "mm" }, // Myanmar
      };

      placesService.getPlacePredictions(request, (predictions, status) => {
        if (
          status === window.google.maps.places.PlacesServiceStatus.OK &&
          predictions
        ) {
          const options = predictions.map((prediction) => ({
            value: prediction.description,
            label: prediction.description,
          }));

          if (type === "waypoint" && waypointKey) {
            setPredictions((prev) => ({
              ...prev,
              waypoints: { ...prev.waypoints, [waypointKey]: options },
            }));
          } else {
            setPredictions((prev) => ({ ...prev, [type]: options }));
          }
        }
      });
    } catch (error) {
      console.error("Error fetching place predictions:", error);
    }
  };

  const handleAddWaypoint = () => {
    if (waypoints.length < 24) {
      setWaypoints((prev) => [...prev, { key: Date.now(), value: "" }]);
    }
  };

  const handleDeleteWaypoint = (key) => {
    setWaypoints((prev) => prev.filter((w) => w.key !== key));
  };

  const handleWaypointChange = (key, value) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.key === key ? { ...wp, value } : wp))
    );
  };

  const handleManualPin = (type, waypointKey = null) => {
    if (onSetManualPin) {
      message.info("Click on the map to set the location");
      onSetManualPin(type, waypointKey);
    }
  };

  const getZapButtonStyle = (isActive) => ({
    backgroundColor: isActive ? "#1890ff" : undefined,
    borderColor: isActive ? "#1890ff" : undefined,
    color: isActive ? "#fff" : undefined,
  });

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        borderRadius: "10px",
        height: "50vh",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          textAlign: "center",
          padding: "16px",
          borderBottom: "1px solid #ddd",
        }}
      >
        <h3 style={{ margin: 0 }}>Route Calculation</h3>
      </div>

      <div
        style={{
          overflowY: "auto",
          padding: "16px",
          flex: 1,
        }}
      >
        <Space direction="vertical" style={{ width: "100%" }} size="middle">
          {/* Origin */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <AutoComplete
              value={origin}
              options={predictions.origin}
              style={{ flex: 1 }}
              onSearch={(text) => {
                setOrigin(text);
                getPlacePredictions(text, "origin");
              }}
              onChange={(text) => setOrigin(text)}
              placeholder="Origin"
              allowClear
            />
            <Button
              icon={<Zap size={18} />}
              size="middle"
              shape="circle"
              style={getZapButtonStyle(manualPinMode?.type === "origin")}
              onClick={() => handleManualPin("origin")}
              title="Set custom marker"
            />
          </div>

          {/* Waypoints */}
          {waypoints.map((wp, idx) => (
            <div
              key={wp.key}
              style={{
                display: "flex",
                gap: "8px",
                width: "100%",
              }}
            >
              <AutoComplete
                value={wp.value}
                options={predictions.waypoints[wp.key] || []}
                style={{ flex: 1 }}
                onSearch={(text) => {
                  handleWaypointChange(wp.key, text);
                  getPlacePredictions(text, "waypoint", wp.key);
                }}
                onChange={(text) => handleWaypointChange(wp.key, text)}
                placeholder={`Waypoint ${idx + 1}`}
                allowClear
              />
              <Button
                danger
                icon={<Trash2 size={16} />}
                size="middle"
                shape="circle"
                onClick={() => handleDeleteWaypoint(wp.key)}
                title="Delete waypoint"
              />
              <Button
                icon={<Zap size={18} />}
                size="middle"
                shape="circle"
                style={getZapButtonStyle(
                  manualPinMode?.type === "waypoint" &&
                    manualPinMode?.key === wp.key
                )}
                onClick={() => handleManualPin("waypoint", wp.key)}
                title="Set custom marker"
              />
            </div>
          ))}

          {/* Add waypoint button */}
          {waypoints.length < 24 && (
            <Button
              type="dashed"
              block
              icon={<Plus size={16} />}
              onClick={handleAddWaypoint}
            >
              Add Waypoint
            </Button>
          )}

          {/* Destination */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <AutoComplete
              value={destination}
              options={predictions.destination}
              style={{ flex: 1 }}
              onSearch={(text) => {
                setDestination(text);
                getPlacePredictions(text, "destination");
              }}
              onChange={(text) => setDestination(text)}
              placeholder="Destination"
              allowClear
            />
            <Button
              icon={<Zap size={18} />}
              size="middle"
              shape="circle"
              style={getZapButtonStyle(manualPinMode?.type === "destination")}
              onClick={() => handleManualPin("destination")}
              title="Set custom marker"
            />
          </div>
        </Space>
      </div>

      <div
        style={{
          padding: "16px",
          borderTop: "1px solid #ddd",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px" }}>
          <Text>Distance: {distance || "--"} </Text>
          <Text>Duration: {duration || "--"} </Text>
        </div>

        <Button
          type="primary"
          style={{ width: "100%", marginTop: "8px" }}
          onClick={onCalculateRoute}
        >
          Calculate Route
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
