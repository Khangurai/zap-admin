import React, { useEffect, useState } from "react";
import { supabase } from "../../../../server/supabase/supabaseClient";
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
} from "@vis.gl/react-google-maps";
import { Zap } from "lucide-react";

const UserMarker = ({ user }) => {
  const [infowindowShown, setInfowindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [hovered, setHovered] = useState(false);

  const handleMarkerClick = () => {
    setInfowindowShown((s) => !s);
  };

  const handleClose = () => {
    setInfowindowShown(false);
  };

  const handleMouseEnter = () => {
    setHovered(true);
    setInfowindowShown(true);
  };
  const handleMouseLeave = () => {
    setHovered(false);
    setInfowindowShown(false);
  };

  const markerStyle = {
    cursor: "pointer",
    transform: hovered ? "scale(1.3)" : "scale(1)",
    transition: "transform 0.1s ease-in-out",
    filter: hovered ? "drop-shadow(0 0 5px rgba(255, 255, 0, 0.8))" : "none",
  };

  // Use grey color if user.status is false (inactive)
  const iconColor = user.status ? "red" : "grey";
  const iconFill = user.status ? "red" : "grey";

  return (
    <>
      <style>{`
        .gm-ui-hover-effect {
          display: none !important;
        }
        .gm-ui-hover-effect img {
          display: none !important;
        }
      `}</style>

      <AdvancedMarker
        ref={markerRef}
        position={{ lat: user.latitude, lng: user.longitude }}
        onClick={handleMarkerClick}
      >
        <div
          style={markerStyle}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          <Zap size={24} color={iconColor} fill={iconFill} />
        </div>
      </AdvancedMarker>

      {infowindowShown && (
        <InfoWindow anchor={marker} onCloseClick={handleClose}>
          <div
            style={{
              padding: "10px 15px",
              maxWidth: "280px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
              background: "linear-gradient(145deg, #ffffff, #f9fafb)",
              borderRadius: "14px",
              boxShadow: "0 8px 20px rgba(0, 0, 0, 0.08)",
              border: "1px solid rgba(229, 231, 235, 0.7)",
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "36px",
                  borderRadius: "50%",
                  backgroundColor: user.status ? "#fee2e2" : "#e5e7eb", // lighter grey background if inactive
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Zap size={18} color={iconColor} fill={iconFill} />
              </div>
              <div
                style={{
                  fontSize: "16px",
                  fontWeight: "600",
                  color: "#1f2937",
                }}
              >
                {user.name}
              </div>
            </div>

            <div
              style={{
                fontSize: "14px",
                color: "#6b7280",
                lineHeight: "1.4",
              }}
            >
              📍 Lat: {user.latitude.toFixed(4)}, Lng: {user.longitude.toFixed(4)}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const UserMarkers = () => {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const { data: usersData, error } = await supabase
        .from("users")
        .select("id, name, longitude, latitude, status") // include status here
        .not("longitude", "is", null)
        .not("latitude", "is", null);

      if (error) {
        console.error("Error fetching users:", error);
      } else if (usersData) {
        setUsers(usersData);
      }
    };

    fetchUsers();
  }, []);

  return (
    <>
      {users.map(
        (user) =>
          user.latitude &&
          user.longitude && <UserMarker key={user.id} user={user} />
      )}
    </>
  );
};

export default UserMarkers;
