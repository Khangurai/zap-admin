import React, { useState } from "react";
import { Button, Space } from "antd";
import { Plus, X } from "lucide-react";
import PlaceAutocomplete from "./PlaceAutocomplete";

const ControlPanel = ({ onOriginChange, onDestinationChange, onWaypointsChange }) => {
  const [waypoints, setWaypoints] = useState([]);

  const addWaypoint = () => {
    const updated = [...waypoints, null];
    setWaypoints(updated);
    onWaypointsChange(updated);
  };

  const removeWaypoint = (index) => {
    const updated = waypoints.filter((_, i) => i !== index);
    setWaypoints(updated);
    onWaypointsChange(updated);
  };

  const updateWaypoint = (place, index) => {
    const updated = [...waypoints];
    updated[index] = place;
    setWaypoints(updated);
    onWaypointsChange(updated);
  };

  return (
    <Space direction="vertical" style={{ width: "100%" }}>
      <PlaceAutocomplete placeholder="Origin" onPlaceSelected={onOriginChange} />
      {waypoints.map((wp, index) => (
        <div key={index} style={{ display: "flex", gap: "8px" }}>
          <PlaceAutocomplete
            placeholder={`Waypoint ${index + 1}`}
            onPlaceSelected={(place) => updateWaypoint(place, index)}
          />
          <Button danger icon={<X />} onClick={() => removeWaypoint(index)} />
        </div>
      ))}
      <Button icon={<Plus />} onClick={addWaypoint}>Add Waypoint</Button>
      <PlaceAutocomplete placeholder="Destination" onPlaceSelected={onDestinationChange} />
    </Space>
  );
};

export default ControlPanel;
