import { useState } from "react";

export default function HRControls() {
  const [question, setQuestion] = useState("");

  function askQuestion() {
    if (!question) return;
    alert("HR asked: " + question);
    setQuestion("");
  }

  return (
    <div style={{ marginTop: "15px" }}>
      <h3>HR Controls</h3>

      <input
        placeholder="Ask a question"
        value={question}
        onChange={(e) => setQuestion(e.target.value)}
      />

      <button onClick={askQuestion}>🎤 Ask</button>
    </div>
  );
}
