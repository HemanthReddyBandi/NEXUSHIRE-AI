import Webcam from "../components/Webcam";
import HRControls from "../components/HRControls";
import InterviewStats from "../components/InterviewStats";

export default function HRInterviewRoom({
  roomId,
  emotionTimeline,
  answerTimeline
}) {
  return (
    <div className="card">
      <h2>Live Interview Room</h2>
      <p>Room ID: {roomId}</p>

      <div style={{ display: "flex", gap: "20px" }}>
        <Webcam active />

        <InterviewStats
          emotionTimeline={emotionTimeline}
          answerTimeline={answerTimeline}
        />
      </div>

      <HRControls />
    </div>
  );
}
