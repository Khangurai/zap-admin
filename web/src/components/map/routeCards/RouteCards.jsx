import React, { useState } from "react";
import {
  Card,
  Col,
  Row,
  Avatar,
  Tooltip,
  Typography,
  Divider,
  Select,
  Tag,
  Button,
} from "antd";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";
const { Paragraph } = Typography;

const { Title, Text } = Typography;

// Users select tag color options
const colorOptions = [
  { value: "gold", label: "Gold" },
  { value: "lime", label: "Lime" },
  { value: "green", label: "Green" },
  { value: "cyan", label: "Cyan" },
];

// Render colored tags
const tagRender = (props) => {
  const { label, value, closable, onClose } = props;
  const onPreventMouseDown = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };
  return (
    <Tag
      color={value}
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      style={{ marginInlineEnd: 4 }}
    >
      {label}
    </Tag>
  );
};

const RouteCards = ({ savedRouteGeoJSON }) => {
  // 🔹 Driver State
  const [selectedDriver, setSelectedDriver] = useState(null);

  // 🔹 Users State
  const [selectedUsers, setSelectedUsers] = useState(["gold", "cyan"]);

  const driverOptions = [
    { value: "1", label: "Jack" },
    { value: "2", label: "Lucy" },
    { value: "3", label: "Tom" },
  ];

  const getInitial = (name) => (name ? name.charAt(0).toUpperCase() : "U");

  const selectedDriverLabel =
    driverOptions.find((d) => d.value === selectedDriver)?.label || null;

  return (
    <Row gutter={16}>
      <Col span={24}>
        <Card variant="bordered" style={{ padding: "16px" }}>
          <Row>
            {/* Left side: Route name */}
            <Col
              span={3}
              style={{ borderRight: "1px solid #f0f0f0", paddingRight: "16px" }}
            >
              <Title level={4} style={{ margin: 0 }}>
                Route 1
              </Title>
              <Text type="secondary">Bus Route - (1)</Text>
            </Col>

            {/* Right side: Details */}
            <Col span={21} style={{ paddingLeft: "24px", textAlign: "left" }}>
              {/* Driver */}
              <Text strong>Driver:</Text>{" "}
              <Avatar
                style={{
                  backgroundColor: "#fde3cf",
                  color: "#f56a00",
                  marginRight: 8,
                }}
              >
                {getInitial(selectedDriverLabel)}
              </Avatar>
              <div style={{ marginTop: 5 }}>
                <Text strong>Driver Selected:</Text>
                <Select
                  showSearch
                  style={{ width: 160, marginLeft: 8 }}
                  placeholder="Select a driver"
                  value={selectedDriver}
                  onChange={(val) => setSelectedDriver(val)}
                  filterOption={(input, option) =>
                    (option?.label ?? "")
                      .toLowerCase()
                      .includes(input.toLowerCase())
                  }
                  options={driverOptions}
                />
              </div>
              <Divider style={{ margin: "8px 0" }} />
              {/* Users */}
              <Text strong>Users:</Text>{" "}
              <Avatar.Group maxCount={4}>
                {selectedUsers.map((user, i) => (
                  <Tooltip key={i} title={user} placement="top">
                    <Avatar style={{ backgroundColor: user }}>
                      {user.charAt(0).toUpperCase()}
                    </Avatar>
                  </Tooltip>
                ))}
              </Avatar.Group>
              <div style={{ marginTop: 5 }}>
                <Text strong>Users Selected:</Text>
                <Select
                  mode="multiple"
                  tagRender={tagRender}
                  value={selectedUsers}
                  onChange={(val) => setSelectedUsers(val)}
                  style={{ width: "100%", marginTop: 4 }}
                  options={colorOptions}
                />
              </div>
              <Divider style={{ margin: "8px 0" }} />
              {/* Display GeoJSON */}
              <h3 style={{ margin: 0, fontSize: "14px" }}>
                Saved Route (GeoJSON)
              </h3>
              {savedRouteGeoJSON && (
                <div style={{ marginTop: "12px" }}>
                  <Paragraph
                    copyable
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
                    {JSON.stringify(savedRouteGeoJSON, null, 2)}
                  </Paragraph>
                </div>
              )}
              <Button style={{ marginRight: 8 }}>Edit</Button>
              <Button type="primary" danger>
                Delete
              </Button>
            </Col>
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default RouteCards;
