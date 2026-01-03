import { useEffect, useRef, useState } from "react";

export default function VoiceAnswer({
  disabled = false,
  onStartAnswer,
  onStopAnswer
}) {
  const [answer, setAnswer] = useState("");
  const recognitionRef = useRef(null);

  useEffect(() => {
    return () => {
      recognitionRef.current?.stop();
    };
  }, []);

  function startListening() {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition not supported in this browser");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onstart = () => {
      onStartAnswer?.();
    };

    recognition.onresult = (event) => {
      let text = "";
      for (let i = 0; i < event.results.length; i++) {
        text += event.results[i][0].transcript;
      }
      setAnswer(text);
    };

    recognitionRef.current = recognition;
    recognition.start();
  }

  function stopListening() {
    recognitionRef.current?.stop();
    onStopAnswer?.(answer);
  }

  return (
    <div style={{ marginTop: "20px" }}>
      <textarea
        rows={4}
        value={answer}
        placeholder="Speak your answer or type here..."
        onChange={(e) => setAnswer(e.target.value)}
        disabled={disabled}
        style={{ width: "100%", padding: "10px" }}
      />

      <div style={{ marginTop: "10px" }}>
        <button onClick={startListening} disabled={disabled}>
          🎙 Start Answer
        </button>
        <button onClick={stopListening} style={{ marginLeft: "10px" }}>
          ⏹ Stop
        </button>
      </div>
    </div>
  );
}
