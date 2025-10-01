import React, { useState } from "react";
import { Row, Col } from "antd";
import { APIProvider } from "@vis.gl/react-google-maps";
import MapComponent from "../../components/map/MapComponent";
// import "./index.css";
import RouteCards from "../../components/map/routeCards/RouteCards";

const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;

const Index = () => {
  const [savedRouteGeoJSON, setSavedRouteGeoJSON] = useState(null);
  const [showRouteCard, setShowRouteCard] = useState(false);

  const handleSaveRoute = (geoJSON) => {
    setSavedRouteGeoJSON(geoJSON);
    setShowRouteCard(true);
  };

  return (
    <APIProvider apiKey={apiKey}>
      <Col span={24}>
        <MapComponent setSavedRouteGeoJSON={handleSaveRoute} />
      </Col>

      <Row>
        <Col span={24}>
          <div
          // style={{
          //   padding: "20px",
          //   boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          //   marginTop: "20px",
          // }}
          >
            {showRouteCard && (
              <RouteCards savedRouteGeoJSON={savedRouteGeoJSON} />
            )}
            {/* <h3 style={{ textAlign: "center" }}>Map and Control Panel</h3>
          <p style={{ textAlign: "center" }}>
            Use the control panel to set origin and destination for route
            calculations.
          </p> */}
          </div>
        </Col>
      </Row>
    </APIProvider>
  );
};

export default Index;
