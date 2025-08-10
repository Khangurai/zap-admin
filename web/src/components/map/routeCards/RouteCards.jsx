import React from "react";
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
} from "antd";
import { AntDesignOutlined, UserOutlined } from "@ant-design/icons";

const { Title, Text } = Typography;

const options = [
  { value: "gold" },
  { value: "lime" },
  { value: "green" },
  { value: "cyan" },
];

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

const RouteCards = () => (
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
            <Text strong>Township:</Text> <Text>North Okkala, Mayangone</Text>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Route Details:</Text>
            <p style={{ marginBottom: 8 }}>
              North Okkala (Thanda), Kan Thar Yar, New Thargi, Maydarwi, Ahwine,
              Lanwa, Kaba Aye Road, Myanmar Plaza, Shwe Gone Daing, Myay Ni
              Gone, Sanchaung - Times City
            </p>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Driver:</Text>{" "}
            <Avatar
              style={{
                backgroundColor: "#fde3cf",
                color: "#f56a00",
                marginRight: 8,
              }}
            >
              U
            </Avatar>
            <div style={{ marginTop: 5 }}>
              <Text strong>Driver Selected:</Text>
              <Select
                mode="multiple"
                tagRender={tagRender}
                defaultValue={["gold", "cyan"]}
                style={{ width: "100%", marginTop: 4 }}
                options={options}
              />
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Users:</Text>{" "}
            <Avatar.Group maxCount={4}>
              <Avatar src="https://api.dicebear.com/7.x/miniavs/svg?seed=1" />
              <Avatar style={{ backgroundColor: "#f56a00" }}>K</Avatar>
              <Tooltip title="Ant User" placement="top">
                <Avatar
                  style={{ backgroundColor: "#87d068" }}
                  icon={<UserOutlined />}
                />
              </Tooltip>
              <Avatar
                style={{ backgroundColor: "#1677ff" }}
                icon={<AntDesignOutlined />}
              />
            </Avatar.Group>
            {/* Select with tag render */}
            <div style={{ marginTop: 5 }}>
              <Text strong>Users Selected:</Text>
              <Select
                mode="multiple"
                tagRender={tagRender}
                defaultValue={["gold", "cyan"]}
                style={{ width: "100%", marginTop: 4 }}
                options={options}
              />
            </div>
            <Divider style={{ margin: "8px 0" }} />
            <Text strong>Route Code:</Text> <Text>JUHI89</Text>
          </Col>
        </Row>
      </Card>
    </Col>
  </Row>
);

export default RouteCards;
