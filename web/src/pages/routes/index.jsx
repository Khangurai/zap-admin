import React, { useState } from "react";
import { Row, Col, message } from "antd";
import ControlPanel from "../../components/MapComponents/ControlPanel";
import MapComponent from "../../components/MapComponents/Map";
import MapHandler from "../../components/MapComponents/MapHandler";

const Index = () => {
  const [origin, setOrigin] = useState(null);
  const [destination, setDestination] = useState(null);
  const [waypoints, setWaypoints] = useState([]);

  return (
    <>
      <Row gutter={16}>
        <Col span={6}>
          <ControlPanel
            onOriginChange={setOrigin}
            onDestinationChange={setDestination}
            onWaypointsChange={setWaypoints}
          />
        </Col>
        <Col span={18}>
          <MapComponent />
          <MapHandler
            origin={origin}
            destination={destination}
            waypoints={waypoints}
          />
        </Col>
      </Row>
      <Row>
        <Col span={24}>
          <div
            style={{
              padding: "20px",
              backgroundColor: "#f0f2f5",
              borderRadius: "10px",
              boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
              marginTop: "20px",
            }}
          >
            <h3 style={{ textAlign: "center" }}>Map and Control Panel</h3>
            <p style={{ textAlign: "center" }}>
              Use the control panel to set origin and destination for route
              calculations.
            </p>
          </div>
        </Col>
      </Row>
    </>
  );
};

export default Index;
