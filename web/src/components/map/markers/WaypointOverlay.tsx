import React from "react";
import { Card, Row, Col } from "antd";
import { DragOutlined } from "@ant-design/icons";
import { GripVertical } from "lucide-react";

export function WaypointOverlay({ waypoint, index }) {
  return (
    <Card
      size="small"
      style={{
        opacity: 0.9,
        transform: "rotate(5deg)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.15)",
        width: 300,
      }}
      bodyStyle={{ padding: "12px" }}
    >
      <Row align="middle" gutter={[12, 0]}>
        <Col>
          <GripVertical size={16} style={{ color: "#1890ff" }} />
        </Col>
        <Col>
          <div
            style={{
              width: 24,
              height: 24,
              borderRadius: "50%",
              backgroundColor: "#1890ff",
              color: "white",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            {index + 1}
          </div>
        </Col>
        <Col flex="auto">
          <span style={{ fontSize: "14px" }}>
            {waypoint.name || waypoint.formatted_address}
          </span>
        </Col>
      </Row>
    </Card>
  );
}
