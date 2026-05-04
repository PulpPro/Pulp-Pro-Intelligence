export default function DashboardPage() {
  const cardStyle = {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    boxShadow: "0 4px 10px rgba(0,0,0,0.3)"
  };

  return (
    <div>
      <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>
        Dashboard
      </h1>

      <p style={{ color: "#94a3b8", marginTop: "5px" }}>
        Overview of your ripening process
      </p>

      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(3, 1fr)",
        gap: "20px",
        marginTop: "30px"
      }}>
        
        <div style={cardStyle}>
          <p style={{ color: "#94a3b8" }}>Active Batches</p>
          <h2 style={{ fontSize: "24px", marginTop: "10px" }}>12</h2>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#94a3b8" }}>Average Temperature</p>
          <h2 style={{ fontSize: "24px", marginTop: "10px" }}>18°C</h2>
        </div>

        <div style={cardStyle}>
          <p style={{ color: "#94a3b8" }}>Alerts</p>
          <h2 style={{ fontSize: "24px", marginTop: "10px", color: "#f87171" }}>
            2 Critical
          </h2>
        </div>

      </div>
    </div>
  );
}