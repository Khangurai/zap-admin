import React, { useEffect, useState, useRef } from "react";
import { supabase } from "../../../../server/supabase/supabaseClient";
import {
  AdvancedMarker,
  InfoWindow,
  useAdvancedMarkerRef,
  useMap,
} from "@vis.gl/react-google-maps";
import { Zap } from "lucide-react";
// import { MarkerClusterer } from "@googlemaps/markerclusterer";

const UserMarker = ({ user, index, onMarkerCreated, onMarkerUnmounted }) => {
  const [infowindowShown, setInfowindowShown] = useState(false);
  const [markerRef, marker] = useAdvancedMarkerRef();
  const [hovered, setHovered] = useState(false);
  const [visible, setVisible] = useState(false);

  // Drop and bounce animation
  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setVisible(true);
    }, index * 100); // 100ms delay per marker
    return () => clearTimeout(timeout);
  }, [index]);

  useEffect(() => {
    if (marker) {
      // onMarkerCreated(marker);
    }
    return () => {
      if (marker) {
        // onMarkerUnmounted(marker);
      }
    };
  }, [marker, onMarkerCreated, onMarkerUnmounted]);

  const markerStyle = {
    cursor: "pointer",
    transform: visible ? "scale(1)" : "translateY(-100vh) scale(0)",
    opacity: visible ? 1 : 0,
    transition: visible
      ? "transform 0.5s cubic-bezier(0.68, -0.55, 0.27, 1.55), opacity 0.5s ease"
      : "transform 0.1s ease, opacity 0.1s ease",
    filter: hovered ? "drop-shadow(0 0 5px rgba(255, 255, 0, 0.8))" : "none",
  };

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
        onClick={() => setInfowindowShown((s) => !s)}
        icon={{
          url: "data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs=",
        }}
      >
        <div
          style={markerStyle}
          onMouseEnter={() => {
            setHovered(true);
            setInfowindowShown(true);
          }}
          onMouseLeave={() => {
            setHovered(false);
            setInfowindowShown(false);
          }}
        >
          <Zap size={24} color={iconColor} fill={iconFill} />
        </div>
      </AdvancedMarker>

      {infowindowShown && (
        <InfoWindow
          anchor={marker}
          onCloseClick={() => setInfowindowShown(false)}
        >
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
                  backgroundColor: user.status ? "#fee2e2" : "#e5e7eb",
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
              📍 Lat: {user.latitude.toFixed(4)}, Lng:{" "}
              {user.longitude.toFixed(4)}
            </div>
          </div>
        </InfoWindow>
      )}
    </>
  );
};

const UserMarkers = ({ reloadKey }) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const map = useMap();
  // const clusterer = useRef(null);
  // const [clusterVisible, setClusterVisible] = useState(false);

  // useEffect(() => {
  //   if (!map) return;

  //   // clear old markers and clusterer
  //   clusterer.current?.clearMarkers();
  //   clusterer.current = null;
  //   setClusterVisible(false);

  //   const totalAnimationTime = users.length * 100 + 500;

  //   const clusterTimeout = setTimeout(() => {
  //     clusterer.current = new MarkerClusterer({ map });
  //     setClusterVisible(true);
  //   }, totalAnimationTime);

  //   return () => {
  //     clearTimeout(clusterTimeout);
  //     clusterer.current?.clearMarkers();
  //   };
  // }, [map, users.length, reloadKey]); // reloadKey ကို dependency ထဲထည့်ပါ

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const { data: usersData, error } = await supabase
        .from("users")
        .select("id, name, longitude, latitude, status")
        .not("longitude", "is", null)
        .not("latitude", "is", null);

      if (error) {
        console.error("Error fetching users:", error);
      } else if (usersData) {
        setUsers(usersData);
      }
      setLoading(false);
    };

    fetchUsers();
  }, [reloadKey]);

  // const handleMarkerCreated = (marker) => {
  //   if (clusterer.current && clusterVisible) {
  //     clusterer.current.addMarker(marker);
  //   }
  // };

  // const handleMarkerUnmounted = (marker) => {
  //   if (clusterer.current) {
  //     clusterer.current.removeMarker(marker);
  //   }
  // };

  if (loading) {
    return (
      <div style={{ padding: 20, textAlign: "center" }}>Loading markers...</div>
    );
  }

  return (
    <>
      {users.map(
        (user, index) =>
          user.latitude &&
          user.longitude && (
            <UserMarker
              key={user.id}
              user={user}
              index={index}
              // onMarkerCreated={handleMarkerCreated}
              // onMarkerUnmounted={handleMarkerUnmounted}
            />
          )
      )}
    </>
  );
};

export default UserMarkers;
