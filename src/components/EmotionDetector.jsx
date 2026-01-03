import { useEffect, useRef, useState } from "react";
import * as faceapi from "face-api.js";

export default function EmotionDetector({ videoRef, onEmotionDetected }) {
  const emotionBuffer = useRef([]);
  const [modelsLoaded, setModelsLoaded] = useState(false);

  /* ---------------- LOAD MODELS SAFELY ---------------- */
  useEffect(() => {
    let mounted = true;

    async function loadModels() {
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri("/models");
        await faceapi.nets.faceExpressionNet.loadFromUri("/models");
        if (mounted) setModelsLoaded(true);
      } catch (err) {
        console.warn("FaceAPI model load failed:", err);
      }
    }

    loadModels();
    return () => (mounted = false);
  }, []);

  /* ---------------- DETECTION LOOP (GUARDED) ---------------- */
  useEffect(() => {
    if (!modelsLoaded) return;

    const video = videoRef?.current;
    if (!video) return;

    // ❗ VERY IMPORTANT GUARD
    if (video.readyState < 2) return;

    const interval = setInterval(async () => {
      try {
        // Skip if video not usable
        if (
          !video ||
          video.paused ||
          video.ended ||
          video.videoWidth === 0 ||
          video.videoHeight === 0
        ) {
          return;
        }

        const detection = await faceapi
          .detectSingleFace(
            video,
            new faceapi.TinyFaceDetectorOptions()
          )
          .withFaceExpressions();

        if (!detection?.expressions) return;

        emotionBuffer.current.push(detection.expressions);
        emotionBuffer.current = emotionBuffer.current.slice(-5);

        const totals = {
          neutral: 0,
          happy: 0,
          sad: 0,
          angry: 0,
          fearful: 0,
          disgusted: 0,
          surprised: 0
        };

        emotionBuffer.current.forEach((e) => {
          Object.keys(totals).forEach((k) => {
            totals[k] += e[k] || 0;
          });
        });

        const dominant = Object.keys(totals).reduce((a, b) =>
          totals[a] > totals[b] ? a : b
        );

        onEmotionDetected?.(dominant);
      } catch {
        // 🚫 NEVER crash render
      }
    }, 800);

    return () => clearInterval(interval);
  }, [modelsLoaded, videoRef, onEmotionDetected]);

  return null;
}
