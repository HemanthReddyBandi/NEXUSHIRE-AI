// src/hr/HRInterviewRoom.jsx
import Webcam from "../components/Webcam";

export default function HRInterviewRoom({
  role,
  roomId,
  isHR,
  onEnd
}) {
  return (
    <div className="card">
      <h2 style={{ marginBottom: "10px" }}>
        🧑‍💼 HR Live Interview
      </h2>

      <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
        Room ID: <strong>{roomId}</strong>
      </p>

      <p style={{ color: "#38bdf8", marginBottom: "15px" }}>
        Role: <strong>{role.toUpperCase()}</strong>
      </p>

      <div
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "20px",
          marginBottom: "20px"
        }}
      >
        {/* Candidate / HR Video */}
        <Webcam active />

        {/* Placeholder for other participant */}
        <div
          style={{
            width: "260px",
            height: "200px",
            background: "#020617",
            border: "1px dashed #334155",
            borderRadius: "10px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "#64748b",
            fontSize: "0.85rem"
          }}
        >
          Waiting for other participant…
        </div>
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={onEnd}
          style={{
            background: "#7f1d1d",
            width: "100%"
          }}
        >
          ⛔ End Interview
        </button>
      </div>
    </div>
  );
}
