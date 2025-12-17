import React, { useEffect, useRef } from 'react';

interface RobotAvatarProps {
  isSpeaking: boolean;
  volume: number; // 0 to 1
  size?: 'sm' | 'md' | 'lg';
}

const RobotAvatar: React.FC<RobotAvatarProps> = ({ isSpeaking, volume, size = 'md' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const dimensions = {
    sm: 100,
    md: 200,
    lg: 300
  };

  const pxSize = dimensions[size];

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, pxSize, pxSize);
      const centerX = pxSize / 2;
      const centerY = pxSize / 2;
      
      // Dynamic scaling based on volume
      const scale = 1 + (volume * 0.2); 
      
      // Head Group
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.scale(scale, scale);
      
      // Halo/Glow
      if (isSpeaking) {
        ctx.beginPath();
        ctx.arc(0, 0, pxSize * 0.42, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(59, 130, 246, ${0.2 + (Math.sin(time * 10) * 0.1)})`;
        ctx.fill();
      }

      // Head Base
      ctx.beginPath();
      ctx.roundRect(-pxSize * 0.25, -pxSize * 0.25, pxSize * 0.5, pxSize * 0.45, 20);
      ctx.fillStyle = '#1e293b'; // Slate 800
      ctx.strokeStyle = '#3b82f6'; // Blue 500
      ctx.lineWidth = 4;
      ctx.fill();
      ctx.stroke();

      // Eyes
      const eyeOffset = pxSize * 0.12;
      const eyeY = -pxSize * 0.05;
      const eyeSize = pxSize * 0.08;

      const blink = Math.sin(time * 2) > 0.98;

      ctx.fillStyle = '#60a5fa'; // Blue 400
      
      // Left Eye
      if (!blink) {
        ctx.beginPath();
        ctx.arc(-eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
         ctx.fillRect(-eyeOffset - eyeSize, eyeY, eyeSize * 2, 2);
      }

      // Right Eye
      if (!blink) {
        ctx.beginPath();
        ctx.arc(eyeOffset, eyeY, eyeSize, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(eyeOffset - eyeSize, eyeY, eyeSize * 2, 2);
      }

      // Mouth (The Audio Visualizer Part)
      const mouthY = pxSize * 0.1;
      const mouthWidth = pxSize * 0.2;
      
      ctx.beginPath();
      if (isSpeaking) {
        // Waveform mouth
        ctx.moveTo(-mouthWidth / 2, mouthY);
        for(let i = 0; i <= 10; i++) {
            const x = (-mouthWidth / 2) + (mouthWidth * (i/10));
            // Create a wave that moves and scales with volume
            const y = mouthY + (Math.sin((time * 20) + i) * (volume * 15)); 
            ctx.lineTo(x, y);
        }
      } else {
        // Flat line mouth
        ctx.moveTo(-mouthWidth / 2, mouthY);
        ctx.lineTo(mouthWidth / 2, mouthY);
      }
      ctx.strokeStyle = '#60a5fa';
      ctx.lineWidth = 3;
      ctx.stroke();

      // Antenna
      ctx.beginPath();
      ctx.moveTo(0, -pxSize * 0.25);
      ctx.lineTo(0, -pxSize * 0.35);
      ctx.stroke();
      
      ctx.beginPath();
      ctx.arc(0, -pxSize * 0.38, 5, 0, Math.PI * 2);
      ctx.fillStyle = isSpeaking ? '#ef4444' : '#94a3b8';
      ctx.fill();

      ctx.restore();

      time += 0.02;
      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
    };
  }, [isSpeaking, volume, pxSize]);

  return (
    <canvas 
      ref={canvasRef} 
      width={pxSize} 
      height={pxSize} 
      className="mx-auto"
    />
  );
};

export default RobotAvatar;