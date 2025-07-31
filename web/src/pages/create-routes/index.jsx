import React from "react";
import { Row, Col } from "antd";
import { APIProvider } from "@vis.gl/react-google-maps";
import MapComponent from "../../components/map/MapComponent";
import "./index.css";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Index = () => (
  <APIProvider apiKey={apiKey}>
    <Row gutter={16}>
      <Col span={24}>
        <MapComponent />
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
  </APIProvider>
);

export default Index;