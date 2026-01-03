// src/hr/HRQueue.jsx
import { useEffect } from "react";
import { joinHRQueue } from "./hrMatchStore";

export default function HRQueue({ role, onMatched }) {
  useEffect(() => {
    joinHRQueue(role, onMatched);
  }, [role, onMatched]);

  return (
    <div className="card">
      <h3>🧑‍💼 Waiting for Candidate</h3>
      <p>Role: <strong>{role.toUpperCase()}</strong></p>
      <p>System will auto-connect...</p>
    </div>
  );
}
