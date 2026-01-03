import { useState } from "react";
import "../styles/global.css";

export default function HRLiveHome({ onSelect }) {
  const [roomCode, setRoomCode] = useState("");

  return (
    <div className="card hr-home">

      <h2 className="hr-title">🧑‍💼 HR Live Interview</h2>
      <p className="hr-subtitle">
        Real-time human interviews powered by NEXUS HIRE
      </p>

      <div className="hr-grid">

        {/* ---------------- CANDIDATE ---------------- */}
        <div className="hr-box">
          <h3>🎓 I am a Candidate</h3>

          <button onClick={() => onSelect("candidate_queue")}>
            Join HR Queue
          </button>

          <div className="code-join">
            <input
              type="text"
              placeholder="Enter Interview Code"
              value={roomCode}
              onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
            />
            <button
              disabled={!roomCode}
              onClick={() => onSelect("candidate_code", roomCode)}
            >
              Join With Code
            </button>
          </div>
        </div>

        {/* ---------------- HR ---------------- */}
        <div className="hr-box">
          <h3>🧑‍💼 I am an HR</h3>

          <button onClick={() => onSelect("hr_queue")}>
            Go Online (Queue)
          </button>

          <button
            className="secondary"
            onClick={() => onSelect("hr_create")}
          >
            Create Interview Room
          </button>
        </div>

      </div>
    </div>
  );
}
