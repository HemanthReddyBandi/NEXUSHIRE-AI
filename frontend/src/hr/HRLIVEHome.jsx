// src/hr/HRLiveHome.jsx
import { useState } from "react";
import CandidateQueue from "./CandidateQueue";
import HRQueue from "./HRQueue";
import HRRoom from "./HRLIVEHome";

export default function HRLiveHome({ QUESTIONS }) {
  const [mode, setMode] = useState("select"); 
  const [role, setRole] = useState("");
  const [roomId, setRoomId] = useState("");

  if (mode === "room") {
    return <HRRoom roomId={roomId} />;
  }

  return (
    <div className="card">
      {mode === "select" && (
        <>
          <h3>Live HR Interview</h3>

          <p>Select your role</p>
          {Object.keys(QUESTIONS).map(r => (
            <button
              key={r}
              onClick={() => {
                setRole(r);
                setMode("candidate");
              }}
            >
              🎓 Candidate – {r.toUpperCase()}
            </button>
          ))}

          <hr />

          {Object.keys(QUESTIONS).map(r => (
            <button
              key={r + "_hr"}
              onClick={() => {
                setRole(r);
                setMode("hr");
              }}
            >
              🧑‍💼 HR – {r.toUpperCase()}
            </button>
          ))}
        </>
      )}

      {mode === "candidate" && (
        <CandidateQueue
          role={role}
          onMatched={(room) => {
            setRoomId(room);
            setMode("room");
          }}
        />
      )}

      {mode === "hr" && (
        <HRQueue
          role={role}
          onMatched={(room) => {
            setRoomId(room);
            setMode("room");
          }}
        />
      )}
    </div>
  );
}
