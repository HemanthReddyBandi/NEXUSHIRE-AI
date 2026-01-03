export default function RobotAvatar({ speaking }) {
  return (
    <div
      style={{
        fontSize: "64px",
        margin: "20px 0",
        transition: "transform 0.2s",
        transform: speaking ? "scale(1.1)" : "scale(1)"
      }}
    >
      🤖
    </div>
  );
}
