import { useEffect, useState } from "react";

export default function RealTimeClock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const formattedTime = time.toLocaleTimeString('en-US', {
    hour12: true,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "8px 16px",
        background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        border: "none",
        borderRadius: "12px",
        boxShadow: "0 4px 15px rgba(102, 126, 234, 0.4)",
        fontSize: "14px",
        fontWeight: "600",
        color: "#ffffff",
        fontFamily: "'Segoe UI', 'Roboto', sans-serif",
        letterSpacing: "0.5px",
        minWidth: "120px",
        height: "36px",
        textAlign: "center",
        cursor: "default",
        userSelect: "none",
        transition: "all 0.3s ease",
        backdropFilter: "blur(10px)",
      }}
      onMouseEnter={(e) => {
        e.target.style.transform = "translateY(-2px)";
        e.target.style.boxShadow = "0 6px 20px rgba(102, 126, 234, 0.6)";
      }}
      onMouseLeave={(e) => {
        e.target.style.transform = "translateY(0)";
        e.target.style.boxShadow = "0 4px 15px rgba(102, 126, 234, 0.4)";
      }}
    >
      🕐 {formattedTime}
    </div>
  );
}