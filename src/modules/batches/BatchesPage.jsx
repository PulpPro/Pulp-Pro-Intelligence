export default function BatchesPage() {
  const cardStyle = {
    background: "#1e293b",
    padding: "20px",
    borderRadius: "12px",
    marginBottom: "15px"
  };

  return (
    <div>
      <h1 style={{ fontSize: "26px", fontWeight: "bold" }}>
        Batches
      </h1>

      <p style={{ color: "#94a3b8", marginTop: "5px" }}>
        Manage your ripening batches
      </p>

      <div style={{ marginTop: "30px" }}>
        
        <div style={cardStyle}>
          <h2>Batch A</h2>
          <p style={{ color: "#4ade80" }}>Ripening</p>
        </div>

        <div style={cardStyle}>
          <h2>Batch B</h2>
          <p style={{ color: "#facc15" }}>Ready</p>
        </div>

      </div>
    </div>
  );
}