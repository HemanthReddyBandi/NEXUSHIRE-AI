import { useState } from "react";

export default function HRDashboard({ onCreate }) {
  const [roomId, setRoomId] = useState("");

  function createRoom() {
    const id = Math.random().toString(36).substring(2, 8).toUpperCase();
    setRoomId(id);
    onCreate(id);
  }

  return (
    <div className="card">
      <h2>HR Dashboard</h2>
      <button onClick={createRoom}>➕ Create Interview Session</button>

      {roomId && (
        <p>
          <strong>Room ID:</strong> {roomId}
        </p>
      )}
    </div>
  );
}
