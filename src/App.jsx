import { useState, useRef } from "react";
import Webcam from "./components/Webcam";
import EmotionDetector from "./components/EmotionDetector";
import RobotAvatar from "./components/RobotAvatar";
import VoiceAnswer from "./components/VoiceAnswer";
import { QUESTIONS } from "./data/questions";
import jsPDF from "jspdf";
import "./styles/global.css";

/* ---------------- CONSTANTS ---------------- */
const ENCOURAGEMENTS = [
  "Nice answer.",
  "Good job.",
  "Great explanation.",
  "Well done.",
  "Sounds good.",
  "Excellent."
];

function shuffleArray(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function App() {
  const [mode, setMode] = useState("home"); // home | ai
  const videoRef = useRef(null);

  const [resume, setResume] = useState(null);
  const [role, setRole] = useState("");

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(-1);

  const [speaking, setSpeaking] = useState(false);
  const [showNext, setShowNext] = useState(false);
  const [interviewStopped, setInterviewStopped] = useState(false);

  const [interviewStart, setInterviewStart] = useState(null);
  const [answerStart, setAnswerStart] = useState(null);

  const [analysis, setAnalysis] = useState([]);
  const [lastEvaluation, setLastEvaluation] = useState(null);
  const [emotion, setEmotion] = useState("neutral");

  const [finalFeedback, setFinalFeedback] = useState(null);
  const [recordedVideo, setRecordedVideo] = useState(null);

  /* ---------------- SPEAK ---------------- */
  function speak(text) {
    if (!text) return;
    speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.onstart = () => setSpeaking(true);
    u.onend = () => setSpeaking(false);
    speechSynthesis.speak(u);
  }

  /* ---------------- START AI ---------------- */
  function startAI(roleSelected) {
    if (!resume) return alert("Upload resume first");

    setMode("ai");
    setRole(roleSelected);
    setInterviewStart(Date.now());
    setQuestions([]);
    setAnalysis([]);
    setLastEvaluation(null);
    setFinalFeedback(null);
    setCurrentIndex(-1);
    setInterviewStopped(false);
    setShowNext(false);

    speak("Please explain your key skills and major projects.");
  }

  function onStartAnswer() {
    setAnswerStart(Date.now());
  }

  /* ---------------- EVALUATION ---------------- */
  function evaluateAnswer(text, duration, emotion) {
    if (!text || text.trim() === "") {
      return { score: 0, label: "No Answer" };
    }

    const words = text.trim().split(/\s+/).length;
    let score = 0;

    if (words < 5) score = 20;
    else if (words < 15) score = 40;
    else if (words < 30) score = 60;
    else score = 75;

    if (duration >= 20 && duration <= 90) score += 15;
    if (emotion === "happy" || emotion === "neutral") score += 5;

    score = Math.min(100, score);

    let label =
      score < 40 ? "Needs Improvement" :
      score < 60 ? "Fair" :
      score < 80 ? "Good" : "Excellent";

    return { score, label };
  }

  /* ---------------- STOP ANSWER ---------------- */
  function onStopAnswer(answerText) {
    if (!answerStart) return;

    const now = Date.now();
    const duration = Math.max(
      1,
      Math.floor((now - answerStart) / 1000)
    );

    const evalResult = evaluateAnswer(answerText, duration, emotion);

    const result = {
      question:
        currentIndex === -1
          ? "Resume Introduction"
          : questions[currentIndex],
      duration,
      score: evalResult.score,
      label: evalResult.label,
      emotion
    };

    setAnalysis(prev => [...prev, result]);
    setLastEvaluation(result);

    if (currentIndex === -1) {
      const resumeQs = [
        "Explain one key project from your resume.",
        "What challenges did you face?",
        "What was your role?",
        "What would you improve?",
        "How did you design the solution?"
      ];
      const roleQs = shuffleArray(QUESTIONS[role]).slice(0, 5);
      const finalQs = shuffleArray([...resumeQs, ...roleQs]);
      setQuestions(finalQs);
      setCurrentIndex(0);
    }

    speak(
      `${ENCOURAGEMENTS[Math.floor(Math.random() * ENCOURAGEMENTS.length)]}
       Click Next when ready.`
    );
    setShowNext(true);
  }

  /* ---------------- NEXT ---------------- */
  function nextQuestion() {
    setShowNext(false);

    if (currentIndex + 1 < questions.length) {
      const next = currentIndex + 1;
      setCurrentIndex(next);
      speak(questions[next]);
    } else {
      stopInterview();
    }
  }

  /* ---------------- STOP INTERVIEW ---------------- */
  function stopInterview() {
    setInterviewStopped(true);
    speak("Interview stopped. Generating feedback.");
    generateFinalFeedback();
  }

  /* ---------------- FINAL FEEDBACK ---------------- */
  function generateFinalFeedback() {
    if (analysis.length === 0) return;

    const avg =
      analysis.reduce((s, a) => s + a.score, 0) / analysis.length;

    setFinalFeedback({
      average: Math.round(avg),
      communication:
        avg >= 70
          ? "Clear and structured communication"
          : "Needs improvement in clarity",
      confidence:
        avg >= 75
          ? "Strong confidence throughout"
          : "Confidence can be improved",
      emotionalStability:
        "Mostly emotionally stable responses",
      verdict:
        avg >= 80
          ? "Excellent candidate"
          : avg >= 60
          ? "Good potential"
          : "Needs significant improvement"
    });
  }

  /* ---------------- DOWNLOADS ---------------- */
  function downloadVideo() {
    if (!recordedVideo) return;
    const url = URL.createObjectURL(recordedVideo);
    const a = document.createElement("a");
    a.href = url;
    a.download = "NexusHire_Interview.webm";
    a.click();
  }

  function downloadPDF() {
    const doc = new jsPDF();
    doc.text("NEXUS HIRE – AI Interview Report", 10, 10);
    let y = 25;

    analysis.forEach((a, i) => {
      doc.text(
        `${i + 1}. ${a.question}
Duration: ${a.duration}s
Score: ${a.score}/100 (${a.label})
Emotion: ${a.emotion}`,
        10,
        y
      );
      y += 28;
    });

    doc.text(`Final Verdict: ${finalFeedback.verdict}`, 10, y + 10);
    doc.save("NexusHire_Report.pdf");
  }

  const currentQuestion =
    currentIndex === -1
      ? "Please explain your key skills and projects."
      : questions[currentIndex];

  /* ---------------- UI ---------------- */
  return (
    <>
      <div className="brand">
        <h1>NEXUS HIRE – AI</h1>
        <span>Smart Interviews • Fair Hiring • AI Powered</span>
      </div>

      <div className="container">
        {mode === "home" && (
          <div className="card">
            <p><strong>📄 Upload Resume (MANDATORY)</strong></p>
            <input type="file" onChange={e => setResume(e.target.files[0])} />

            {Object.keys(QUESTIONS).map(r => (
              <button key={r} onClick={() => startAI(r)}>
                🤖 Practice {r.toUpperCase()}
              </button>
            ))}
          </div>
        )}

        {mode === "ai" && (
          <div className="card">
            <RobotAvatar speaking={speaking} />

            <Webcam
              active
              videoRef={videoRef}
              onRecordingReady={setRecordedVideo}
            />

            <EmotionDetector
              videoRef={videoRef}
              onEmotionDetected={setEmotion}
            />

            <p><strong>{currentQuestion}</strong></p>

            <VoiceAnswer
              disabled={speaking || showNext || interviewStopped}
              onStartAnswer={onStartAnswer}
              onStopAnswer={onStopAnswer}
              questionId={currentIndex}
            />

            {/* Evaluation */}
            {lastEvaluation && (
              <div className="card" style={{ marginTop: "10px" }}>
                <p>⏱ {lastEvaluation.duration}s</p>
                <p>
                  🎯 {lastEvaluation.score}/100 ({lastEvaluation.label})
                </p>
                <div style={{ height: "8px", background: "#1e293b" }}>
                  <div
                    style={{
                      width: `${lastEvaluation.score}%`,
                      height: "100%",
                      background:
                        lastEvaluation.score < 40
                          ? "#ef4444"
                          : lastEvaluation.score < 70
                          ? "#facc15"
                          : "#22c55e"
                    }}
                  />
                </div>
              </div>
            )}

            {showNext && !interviewStopped && (
              <button onClick={nextQuestion}>➡ Next Question</button>
            )}

            {!interviewStopped && (
              <button onClick={stopInterview}>⛔ Stop Interview</button>
            )}

            {recordedVideo && (
              <button onClick={downloadVideo}>
                ⬇ Download Interview Video
              </button>
            )}

            {finalFeedback && (
              <div className="card">
                <h3>🤖 AI Feedback Summary</h3>
                <p>📊 Avg Score: {finalFeedback.average}/100</p>
                <p>{finalFeedback.communication}</p>
                <p>{finalFeedback.confidence}</p>
                <p>{finalFeedback.emotionalStability}</p>
                <p><strong>{finalFeedback.verdict}</strong></p>

                <button onClick={downloadPDF}>
                  📄 Download AI Report
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </>
  );
}
