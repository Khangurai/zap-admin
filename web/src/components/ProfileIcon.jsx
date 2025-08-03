import React from "react";
import { LogoutOutlined, EditOutlined } from "@ant-design/icons";
import { Dropdown, message } from "antd";
import avatarPlaceholder from "../assets/profile-user.png";
import { supabase } from "../../server/supabase/supabaseClient";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";
import "./ProfileIcon.css";
import { Zap } from "lucide-react";

const styles = {
  profileContainer: {
    display: "flex",
    alignItems: "center",
    width: "210px",
    height: "50px",
    padding: "0 16px",
    background:
      "linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)",
    borderRadius: "15px",
    border: "1px solid rgba(100, 255, 218, 0.3)",
    boxShadow:
      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)",
    cursor: "pointer",
    transition: "all 0.4s ease",
    userSelect: "none",
    position: "relative",
    overflow: "hidden",
  },

  backgroundStars: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: `
      radial-gradient(2px 2px at 20px 30px, rgba(100, 255, 218, 0.3), transparent),
      radial-gradient(2px 2px at 40px 70px, rgba(255, 255, 255, 0.2), transparent),
      radial-gradient(1px 1px at 90px 40px, rgba(100, 255, 218, 0.4), transparent),
      radial-gradient(1px 1px at 130px 80px, rgba(255, 255, 255, 0.1), transparent)
    `,
    animation: "sparkle 3s ease-in-out infinite alternate",
  },

  contentWrapper: {
    position: "relative",
    zIndex: 2,
    display: "flex",
    alignItems: "center",
    width: "100%",
  },

  avatarContainer: {
    position: "relative",
    marginTop: "25px",
  },

  avatar: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "2px solid rgba(100, 255, 218, 0.5)",
    boxShadow:
      "0 0 20px rgba(100, 255, 218, 0.3), inset 0 0 10px rgba(0, 0, 0, 0.2)",
    filter: "brightness(1.1) contrast(1.1)",
  },

  onlineStatus: {
    display: "inline-block",
    marginLeft: "6px",
    width: "12px",
    height: "12px",
    background: "radial-gradient(circle, #64ffda 0%, #00bcd4 100%)",
    borderRadius: "50%",
    border: "2px solid #0f0f23",
    boxShadow: "0 0 10px rgba(100, 255, 218, 0.8)",
    animation: "pulse 2s ease-in-out infinite",
  },

  userInfo: {
    marginLeft: "12px",
    flex: 1,
    minWidth: 0,
  },

  userName: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: "13px",
    lineHeight: "1.2",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    textShadow: "0 0 10px rgba(255, 255, 255, 0.3)",
  },

  userStatus: {
    color: "#64ffda",
    fontSize: "11px",
    lineHeight: "2",
    marginTop: "2px",
    textShadow: "0 0 8px rgba(100, 255, 218, 0.5)",
    display: "flex",
    alignItems: "center",
  },

  dropdownArrow: {
    marginLeft: "8px",
    color: "rgba(0, 212, 255, 0.7)",
    fontSize: "10px",
    textShadow: "0 0 6px rgba(0, 212, 255, 0.5)",
  },

  dropdownOverlay: {
    minWidth: "210px",
    borderRadius: "16px",
    border: "1px solid rgba(0, 212, 255, 0.25)",
    boxShadow:
      "0 15px 40px rgba(0, 0, 0, 0.6), 0 0 40px rgba(0, 212, 255, 0.15)",
    backdropFilter: "blur(16px)",
  },

  menuHeader: {
    padding: "2px 7px",
    borderBottom: "1px solid rgba(255, 255, 255, 0.1)",
    marginBottom: "8px",
    background: "linear-gradient(135deg, #1a1a2e 0%, #16213e 100%)",
    borderRadius: "10px",
    marginLeft: "1px",
  },

  menuTitle: {
    fontWeight: "600",
    color: "#64ffda",
    fontSize: "14px",
    textShadow: "0 0 10px rgba(100, 255, 218, 0.3)",
    display: "flex",
    alignItems: "center",
    gap: "6px",
  },

  menuSubtitle: {
    fontSize: "12px",
    color: "#b0bec5",
    marginTop: "4px",
  },

  menuItemIcon: {
    marginRight: "10px",
    color: "#64ffda",
    textShadow: "0 0 5px rgba(100, 255, 218, 0.5)",
  },

  logoutItem: {
    display: "flex",
    alignItems: "center",
    padding: "10px 0",
    color: "#ff6b6b",
    transition: "all 0.3s ease",
  },

  logoutIcon: {
    marginRight: "10px",
    textShadow: "0 0 5px rgba(255, 107, 107, 0.5)",
  },
};

const ProfileIcon = () => {
  const navigate = useNavigate();
  const { profile: userProfile } = useAuth();

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      message.error(error.message);
    } else {
      message.success("You have been logged out.");
      navigate("/login");
    }
  };

  const handleMouseEnter = (e) => {
    e.currentTarget.style.transform = "translateY(-3px) scale(1.02)";
    e.currentTarget.style.boxShadow =
      "0 15px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(100, 255, 218, 0.3)";
    e.currentTarget.style.border = "1px solid rgba(100, 255, 218, 0.6)";
  };

  const handleMouseLeave = (e) => {
    e.currentTarget.style.transform = "translateY(0) scale(1)";
    e.currentTarget.style.boxShadow =
      "0 8px 32px rgba(0, 0, 0, 0.3), inset 0 1px 0 rgba(255, 255, 255, 0.1)";
    e.currentTarget.style.border = "1px solid rgba(100, 255, 218, 0.3)";
  };

  const items = [
    {
      key: "1",
      label: (
        <div style={styles.menuHeader}>
          <div style={styles.menuTitle}>
            <img src="./zap-logo.svg" className="logo-icon w-6 h-6" />
            ZAP Commander
          </div>
          <div style={styles.menuSubtitle}>
            {userProfile?.full_name || "Admin"}
          </div>
        </div>
      ),
      disabled: true,
    },
    {
      key: "2",
      label: (
        <div>
          <EditOutlined style={styles.menuItemIcon} />
          <span>Edit Profile</span>
        </div>
      ),
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "5",
      label: (
        <div style={styles.logoutItem}>
          <LogoutOutlined style={styles.logoutIcon} />
          <span>Logout</span>
        </div>
      ),
      onClick: handleLogout,
    },
  ];

  return (
    <>
      <style jsx>{`
        @keyframes sparkle {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.3;
          }
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
            box-shadow: 0 0 10px rgba(100, 255, 218, 0.8);
          }
          50% {
            transform: scale(1.1);
            box-shadow: 0 0 20px rgba(100, 255, 218, 1);
          }
        }
      `}</style>

      <Dropdown
        menu={{ items }}
        placement="bottomRight"
        trigger={["click"]}
        overlayStyle={styles.dropdownOverlay}
      >
        <div
          style={styles.profileContainer}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          onClick={(e) => e.preventDefault()}
        >
          <div style={styles.backgroundStars} />

          <div style={styles.contentWrapper}>
            <div style={styles.avatarContainer}>
              <img
                src={userProfile?.avatar_url || avatarPlaceholder}
                alt="avatar"
                style={styles.avatar}
              />
            </div>

            <div style={styles.userInfo}>
              <div style={styles.userName}>
                {userProfile?.full_name || "Admin"}
              </div>
              <div style={styles.userStatus}>
                Online <span style={styles.onlineStatus} />
              </div>
            </div>

            <div style={styles.dropdownArrow}>▼</div>
          </div>
        </div>
      </Dropdown>
    </>
  );
};

export default ProfileIcon;
