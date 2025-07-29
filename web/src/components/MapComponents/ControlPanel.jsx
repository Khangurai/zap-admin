import React, { useState } from "react";
import { AutoComplete, Button, Space, Typography, Flex } from "antd";
import { Zap, Plus, X } from "lucide-react";

const { Text } = Typography;

const ControlPanel = () => {
  const [waypoints, setWaypoints] = useState([]);

  const addWaypoint = () => {
    setWaypoints((prev) => [...prev, { id: Date.now(), value: "" }]);
  };

  const removeWaypoint = (id) => {
    setWaypoints((prev) => prev.filter((wp) => wp.id !== id));
  };

  const updateWaypointValue = (id, value) => {
    setWaypoints((prev) =>
      prev.map((wp) => (wp.id === id ? { ...wp, value } : wp))
    );
  };

  const inputStyle = { flex: 1, textAlign: "left" };

  return (
    <div
      style={{
        backgroundColor: "#f0f2f5",
        borderRadius: "10px",
        height: "60vh",
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
            <AutoComplete style={inputStyle} placeholder="Origin" allowClear />
            <Button
              icon={<Zap size={18} />}
              size="middle"
              shape="circle"
              title="Set custom marker"
            />
          </div>

          {/* Waypoints */}
          {waypoints.map((wp, index) => (
            <div
              key={wp.id}
              style={{
                display: "flex",
                gap: "5px",
                alignItems: "center",
              }}
            >
              <AutoComplete
                style={inputStyle}
                placeholder={`Waypoint ${index + 1}`}
                allowClear
                value={wp.value}
                onChange={(val) => updateWaypointValue(wp.id, val)}
              />
              <Button
                icon={<Zap size={18} />}
                size="middle"
                shape="circle"
                title="Set custom marker"
              />
              <Button
                icon={<X size={16} />}
                size="middle"
                shape="circle"
                danger
                onClick={() => removeWaypoint(wp.id)}
                title="Remove waypoint"
              />
            </div>
          ))}

          {/* Add waypoint button */}
          <Button
            type="dashed"
            style={{
              flex: 1,
              display: "flex",
              justifyContent: "flex-start",
              alignItems: "center",
              gap: "6px",
              width: "15vw",
            }}
            icon={<Zap size={18} />}
            onClick={addWaypoint}
          >
            Add Waypoint
          </Button>

          {/* Destination */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
            <AutoComplete
              style={inputStyle}
              placeholder="Destination"
              allowClear
            />
            <Button
              icon={<Zap size={18} />}
              size="middle"
              shape="circle"
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
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginBottom: "8px",
          }}
        >
          <Text>Distance: {"--"} </Text>
          <Text>Duration: {"--"} </Text>
        </div>

        <Button type="primary" style={{ width: "100%", marginTop: "8px" }}>
          Calculate Route
        </Button>
      </div>
    </div>
  );
};

export default ControlPanel;
