import { useState } from "react";
import React from "react";
import { Layout, theme } from "antd";
import AppHeader from "./AppHeader";
import Sidebar from "./Sidebar";
import { Outlet } from "react-router-dom";
const { Content } = Layout;

const AppLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();
  return (
    <Layout hasSider>
      <Sidebar collapsed={collapsed} />
      <Layout>
        <AppHeader collapsed={collapsed} setCollapsed={setCollapsed} />
        <Content style={{ margin: "0px 0px 0", overflow: "initial" }}>
          <div
            style={{
              padding: 20,
              textAlign: "center",
              background: colorBgContainer,
              borderRadius: borderRadiusLG,
            }}
          >
            <Outlet />
            {/* {
              // indicates very long content
              Array.from({ length: 100 }, (_, index) => (
                <React.Fragment key={index}>
                  {index % 20 === 0 && index ? "more" : "..."}
                  <br />
                </React.Fragment>
              ))
            } */}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
};
export default AppLayout;
