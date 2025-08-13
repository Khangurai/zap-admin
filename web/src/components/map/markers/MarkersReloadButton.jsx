import React, { useState } from "react";
import { RefreshCcw } from "lucide-react";

const MarkersReloadButton = ({ onReload }) => {
  const [hover, setHover] = useState(false);

  return (
    <button
      onClick={onReload}
      style={{
        background: hover
          ? "rgba(255, 255, 255, 0.9)"
          : "rgba(255, 255, 255, 0.68)",
        border: "1px solid #ddd",
        borderRadius: "8px",
        boxShadow: hover
          ? "0 6px 14px rgba(0, 0, 0, 0.25)"
          : "0 4px 10px rgba(0, 0, 0, 0.15)",
        backdropFilter: "blur(10px)",
        height: "40px",
        padding: "0 12px",
        display: "flex",
        alignItems: "center",
        fontSize: "14px",
        fontWeight: 500,
        color: "#1f2937",
        cursor: "pointer",
        transition: "background 0.3s ease, box-shadow 0.3s ease",
        userSelect: "none",
        gap: 8,
      }}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title="Reload Markers"
      type="button"
    >
      <RefreshCcw size={16} />
      Users
    </button>
  );
};

export default MarkersReloadButton;
