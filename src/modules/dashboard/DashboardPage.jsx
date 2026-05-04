export default function DashboardPage() {
  return (
    <div>
      <h1>Dashboard</h1>

      <div style={{ marginTop: "20px" }}>
        
        <div style={{
          background: "#222",
          padding: "20px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>
          Active Batches: 12
        </div>

        <div style={{
          background: "#222",
          padding: "20px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>
          Avg Temp: 18°C
        </div>

        <div style={{
          background: "#222",
          padding: "20px",
          borderRadius: "10px",
          color: "red"
        }}>
          Alerts: 2
        </div>

      </div>
    </div>
  );
}
``