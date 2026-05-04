import { useState } from "react";
import DashboardPage from "../modules/dashboard/DashboardPage";
import BatchesPage from "../modules/batches/BatchesPage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    if (activePage === "dashboard") return <DashboardPage />;
    if (activePage === "batches") return <BatchesPage />;
  };

  const navItemStyle = (page) => ({
    padding: "10px 15px",
    borderRadius: "8px",
    marginBottom: "8px",
    cursor: "pointer",
    background: activePage === page ? "#333" : "transparent",
    color: activePage === page ? "#4ade80" : "#ccc",
    fontWeight: activePage === page ? "600" : "400"
  });

  return (
    <div style={{ display: "flex", height: "100vh", background: "#0f172a", color: "white", fontFamily: "Arial" }}>
      
      {/* Sidebar */}
      <div style={{ width: "240px", background: "#020617", padding: "20px", borderRight: "1px solid #1e293b" }}>
        <h2 style={{ fontSize: "20px", fontWeight: "bold", marginBottom: "30px" }}>
          Pulp Pro
        </h2>

        <div>
          <div style={navItemStyle("dashboard")} onClick={() => setActivePage("dashboard")}>
            Dashboard
          </div>

          <div style={navItemStyle("batches")} onClick={() => setActivePage("batches")}>
            Batches
          </div>
        </div>
      </div>

      {/* Main */}
      <div style={{ flex: 1, padding: "30px" }}>
        {renderPage()}
      </div>

    </div>
  );
}