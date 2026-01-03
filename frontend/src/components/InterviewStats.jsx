export default function InterviewStats({ emotionTimeline, answerTimeline }) {
  const avgConfidence =
    answerTimeline.length > 0
      ? Math.round(
          answerTimeline.reduce((a, b) => a + b.confidence, 0) /
            answerTimeline.length
        )
      : 0;

  const lastEmotion =
    emotionTimeline.length > 0
      ? emotionTimeline[emotionTimeline.length - 1].emotion
      : "neutral";

  return (
    <div>
      <h3>Candidate Insights</h3>
      <p>🎯 Avg Confidence: {avgConfidence}/100</p>
      <p>🙂 Current Emotion: {lastEmotion}</p>
    </div>
  );
}
