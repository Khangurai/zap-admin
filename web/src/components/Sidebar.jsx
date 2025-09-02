import { Layout, Menu } from "antd";
import { useLocation, useNavigate } from "react-router-dom";
const { Sider } = Layout;
import {
  Map,
  UserCog,
  IdCard,
  Route,
  Rocket,
  Car,
  TestTube,
} from "lucide-react";
import CarsMgmt from "../pages/cars/index.jsx";

const siderStyle = {
  overflow: "auto",
  height: "100vh",
  position: "sticky",
  insetInlineStart: 0,
  top: 0,
  bottom: 0,
  scrollbarWidth: "thin",
  scrollbarGutter: "stable",
};

const Sidebar = ({ collapsed }) => {
  const navigate = useNavigate();
  const location = useLocation();
  // console.log(location.pathname);

  function onClick(e) {
    console.log(e.key);
    navigate(e.key);
  }

  return (
    <Sider trigger={null} collapsible collapsed={collapsed} style={siderStyle}>
      {/* <div className="demo-logo-vertical" /> */}
      <div
        className={`sidebar-header flex items-center ${
          collapsed ? "justify-center" : "space-x-3"
        }`}
        onClick={() => onClick({ key: "/" })}
        style={{ cursor: "pointer" }}
      >
        <div className="logo-container w-10 h-10 bg-gradient-to-br from-nasa-blue to-nasa-cyan rounded-lg flex items-center justify-center">
          {/* <Rocket className="logo-icon w-6 h-6 text-white" /> */}
          <img src="./zap-logo.svg" className="logo-icon w-6 h-6 text-white" />
        </div>
        <div className={`title-container ${collapsed ? "hidden" : ""}`}>
          <h1 className="title text-xl font-bold font-orbitron glow-text">
            ZAP
          </h1>
          <p className="subtitle text-xs text-nasa-gray-400">Mission Control</p>
        </div>
      </div>
      <Menu
        theme="dark"
        mode="inline"
        onClick={onClick}
        selectedKeys={[location.pathname]}
        items={[
          {
            key: "/",
            icon: <Rocket />,
            label: "Mission Control",
          },
          {
            key: "/map-tracking",
            icon: <Map />,
            label: "Map Tracking",
          },
          {
            key: "/routes",
            icon: <Route />,
            label: "Create Route",
          },
          {
            key: "/users",
            icon: <UserCog />,
            label: "Users",
          },
          {
            key: "/cars",
            icon: <Car />,
            label: "Cars Management",
          },
          {
            key: "/testUI",
            icon: <TestTube />,
            label: "testUI",
          },
        ]}
      />
    </Sider>
  );
};

export default Sidebar;
