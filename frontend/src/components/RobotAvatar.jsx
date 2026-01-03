export default function RobotAvatar({ speaking }) {
  return (
    <div className="robot-wrapper">
      <div className={`robot ${speaking ? "talking" : "idle"}`}>
        🤖
      </div>

      <style>{`
        .robot-wrapper {
          display: flex;
          justify-content: center;
          align-items: center;
          margin: 20px 0;
        }

        .robot {
          font-size: 120px; /* BIGGER SIZE */
          transition: all 0.3s ease;
          filter: drop-shadow(0 10px 25px rgba(0,0,0,0.4));
          transform-style: preserve-3d;
        }

        /* IDLE ANIMATION */
        .robot.idle {
          animation: float 3s ease-in-out infinite;
        }

        /* TALKING ANIMATION */
        .robot.talking {
          animation:
            talk 0.25s infinite,
            glow 1s ease-in-out infinite;
          transform: scale(1.1);
        }

        /* Floating idle motion */
        @keyframes float {
          0% { transform: translateY(0px); }
          50% { transform: translateY(-6px); }
          100% { transform: translateY(0px); }
        }

        /* Mouth / head bounce while speaking */
        @keyframes talk {
          0% { transform: scale(1.05) rotateX(0deg); }
          50% { transform: scale(1.15) rotateX(8deg); }
          100% { transform: scale(1.05) rotateX(0deg); }
        }

        /* Neon AI glow */
        @keyframes glow {
          0% {
            text-shadow:
              0 0 10px #22d3ee,
              0 0 20px #22d3ee,
              0 0 30px #0ea5e9;
          }
          50% {
            text-shadow:
              0 0 20px #38bdf8,
              0 0 40px #38bdf8,
              0 0 60px #0ea5e9;
          }
          100% {
            text-shadow:
              0 0 10px #22d3ee,
              0 0 20px #22d3ee,
              0 0 30px #0ea5e9;
          }
        }
      `}</style>
    </div>
  );
}
