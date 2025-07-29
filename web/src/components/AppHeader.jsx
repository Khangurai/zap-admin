import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Button, theme } from "antd";
import { Header } from "antd/es/layout/layout";
import ProfileIcon from "./ProfileIcon";
import RealTimeClock from "./RealTimeClock";

const AppHeader = ({ collapsed, setCollapsed }) => {
  return (
    <Header
      style={{
        padding: "0 16px",
        background: "#d2e6f8ff",
        display: "flex",
        alignItems: "center",
        position: "sticky",
        top: 0,
        zIndex: 1000,
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{
          fontSize: "16px",
          width: 64,
          height: 64,
        }}
      />
      <div
        style={{
          marginLeft: "auto",
          display: "flex",
          alignItems: "center",
          gap: "16px",
        }}
      >
        <RealTimeClock />
        <ProfileIcon />
      </div>
    </Header>
  );
};

export default AppHeader;
