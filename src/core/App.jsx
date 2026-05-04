import { useState } from "react";
import DashboardPage from "../modules/dashboard/DashboardPage";
import BatchesPage from "../modules/batches/BatchesPage";

export default function App() {
  const [activePage, setActivePage] = useState("dashboard");

  const renderPage = () => {
    if (activePage === "dashboard") return <DashboardPage />;
    if (activePage === "batches") return <BatchesPage />;
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "#111", color: "white" }}>
      
      {/* Sidebar */}
      <div style={{ width: "200px", background: "#222", padding: "15px" }}>
        <h2>Pulp Pro</h2>

        <div style={{ marginTop: "20px" }}>
          <p 
            style={{ cursor: "pointer", marginBottom: "10px" }}
            onClick={() => setActivePage("dashboard")}
          >
            Dashboard
          </p>

          <p 
            style={{ cursor: "pointer" }}
            onClick={() => setActivePage("batches")}
          >
            Batches
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: "20px" }}>
        {renderPage()}
      </div>

    </div>
  );
}