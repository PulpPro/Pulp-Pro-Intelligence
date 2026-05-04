import DashboardPage from "../modules/dashboard/DashboardPage";

export default function App() {
  return (
    <div style={{ display: "flex", height: "100vh", background: "#111", color: "white" }}>
      
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#222", padding: "15px" }}>
        <h2>Pulp Pro</h2>
        <p style={{ marginTop: "10px", color: "#aaa" }}>Dashboard</p>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        <DashboardPage />
      </div>

    </div>
  );
}
