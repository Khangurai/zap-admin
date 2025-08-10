import React from "react";
import {
  EditOutlined,
  EllipsisOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Avatar, Card, FloatButton, Row, Col } from "antd";

const { Meta } = Card;

const image ="https://gw.alipayobjects.com/zos/rmsportal/JiqGstEfoWAOHiTxclqi.png"

// Sample data for 5 cars
const cars = [
  {
    id: 1,
    carNumber: "YGN-7A/1234",
    driver: "U Aung Aung",
    image: image,
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=1",
  },
  {
    id: 2,
    carNumber: "YGN-7B/5678",
    driver: "U Hla Hla",
    image: image,
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=2",
  },
  {
    id: 3,
    carNumber: "YGN-7C/4321",
    driver: "Ko Ko Lwin",
    image: image,
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=3",
  },
  {
    id: 4,
    carNumber: "YGN-7D/8765",
    driver: "U Thin Thin",
    image: image,
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=4",
  },
  {
    id: 5,
    carNumber: "YGN-7E/9999",
    driver: "Maung Maung",
    image: image,
    avatar: "https://api.dicebear.com/7.x/miniavs/svg?seed=5",
  },
];

const CarsMgmt = () => (
  <div>
    <Row gutter={[16, 16]} justify="start" style={{ padding: 24 }}>
      {cars.map((car) => (
        <Col key={car.id} xs={24} sm={12} md={8} lg={6}>
          <Card
            style={{ width: "100%" }}
            cover={<img alt={`Car ${car.id}`} src={car.image} />}
            actions={[
              <SettingOutlined key="setting" />,
              <EditOutlined key="edit" />,
              <EllipsisOutlined key="ellipsis" />,
            ]}
          >
            <Meta
              avatar={<Avatar src={car.avatar} />}
              title={car.carNumber}
              description={`Driver: ${car.driver}`}
            />
          </Card>
        </Col>
      ))}
    </Row>
    <div style={{ padding: "20px" }}>
      <FloatButton.BackTop />
    </div>
  </div>
);

export default CarsMgmt;
