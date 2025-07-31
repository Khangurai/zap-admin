import React from "react";
import { SettingOutlined, LogoutOutlined } from "@ant-design/icons";
import { Dropdown, Space, message } from "antd";
import profile from "../assets/profile-user.png";
import { supabase } from "../../server/supabase/supabaseClient"; // Adjust the import path as necessary
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

const ProfileIcon = () => {
  const navigate = useNavigate();
  const { profile: userProfile } = useAuth(); // <-- Get profile from context

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error(error.message);
    } else {
      message.success("You have been logged out.");
      navigate("/login");
    }
  };

  const items = [
    {
      key: "1",
      label: "My Account",
      disabled: true,
    },
    {
      type: "divider",
    },
    {
      key: "2",
      label: "Profile",
    },
    {
      key: "4",
      label: "Settings",
      icon: <SettingOutlined />,
    },
    {
      type: "divider",
    },
    {
      key: "5",
      label: "Logout",
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ];

  return (
    <Dropdown menu={{ items }}>
      <a onClick={(e) => e.preventDefault()}>
        <Space>
          <img src={profile} className="profile-img" style={{marginTop: "25px"}}/>
          {/* Display username, with a fallback */}
          <span style={{ color: "#333", fontWeight: "500",marginTop: "8px" }}>
            {userProfile?.username || "Admin"}
          </span>
        </Space>
      </a>
    </Dropdown>
  );
};
export default ProfileIcon;
