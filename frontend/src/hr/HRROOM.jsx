// src/hr/HRRoom.jsx
import Webcam from "../components/Webcam";

export default function HRRoom({ roomId }) {
  return (
    <div className="card">
      <h2>🔴 Live HR Interview</h2>
      <p>Room ID: <strong>{roomId}</strong></p>

      <div style={{ display: "flex", gap: "20px" }}>
        <Webcam active />
        <Webcam active />
      </div>

      <p>Candidate ↔ HR live session</p>
    </div>
  );
}
