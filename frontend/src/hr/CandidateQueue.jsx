// src/hr/CandidateQueue.jsx
import { useEffect, useState } from "react";
import { joinCandidateQueue } from "./hrMatchStore";

export default function CandidateQueue({ role, onMatched }) {
  const [seconds, setSeconds] = useState(0);

  // ⏱️ Timer
  useEffect(() => {
    const timer = setInterval(() => {
      setSeconds((s) => s + 1);
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  // 🔗 Join Queue
  useEffect(() => {
    joinCandidateQueue(role, onMatched);
  }, [role, onMatched]);

  function formatTime(sec) {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${m}m ${s}s`;
  }

  return (
    <div className="card" style={{ textAlign: "center" }}>
      <h3>⏳ Waiting in Queue</h3>

      <p style={{ marginTop: "10px" }}>
        No HR available at the moment
      </p>

      <p style={{ color: "#38bdf8", marginTop: "8px" }}>
        Selected Role: <strong>{role.toUpperCase()}</strong>
      </p>

      <div
        style={{
          marginTop: "15px",
          padding: "12px",
          background: "#020617",
          borderRadius: "8px",
          border: "1px solid #334155"
        }}
      >
        <p style={{ fontSize: "0.9rem", color: "#94a3b8" }}>
          Waiting Time
        </p>
        <p
          style={{
            fontSize: "1.3rem",
            fontWeight: "700",
            color: "#facc15"
          }}
        >
          {formatTime(seconds)}
        </p>
      </div>

      <p
        style={{
          marginTop: "15px",
          fontSize: "0.85rem",
          color: "#64748b"
        }}
      >
        You will be automatically connected once an HR joins for this role.
      </p>
    </div>
  );
}
