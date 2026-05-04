export default function BatchesPage() {
  return (
    <div>
      <h1>Batches</h1>

      <div style={{ marginTop: "20px" }}>
        <div style={{
          background: "#222",
          padding: "20px",
          marginBottom: "10px",
          borderRadius: "10px"
        }}>
          Batch A - Ripening
        </div>

        <div style={{
          background: "#222",
          padding: "20px",
          borderRadius: "10px"
        }}>
          Batch B - Ready
        </div>
      </div>
    </div>
  );
}