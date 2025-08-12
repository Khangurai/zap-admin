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

  return (
    <>
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
          <Zap size={24} color="red" fill="red" />
        </div>
      </AdvancedMarker>
      {infowindowShown && (
        <InfoWindow anchor={marker} onCloseClick={handleClose}>
          <div
            style={{
              padding: "8px",
              maxWidth: "250px",
              fontFamily:
                "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: "600",
                marginBottom: "4px",
              }}
            >
              {user.name}
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
        .select("id, name, longitude, latitude")
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
