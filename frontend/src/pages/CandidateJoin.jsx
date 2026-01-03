import { useState } from "react";

export default function CandidateJoin({ onJoin }) {
  const [room, setRoom] = useState("");

  return (
    <div className="card">
      <h2>Join HR Interview</h2>

      <input
        placeholder="Enter Room ID"
        value={room}
        onChange={(e) => setRoom(e.target.value.toUpperCase())}
      />

      <button onClick={() => onJoin(room)} disabled={!room}>
        Join Interview
      </button>
    </div>
  );
}
