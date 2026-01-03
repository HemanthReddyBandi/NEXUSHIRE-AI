import { useEffect, useRef, useState } from "react";

export default function Webcam({
  active = false,
  videoRef,
  onRecordingReady
}) {
  const localVideoRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const streamRef = useRef(null);

  const finalVideoRef = videoRef || localVideoRef;

  const [recording, setRecording] = useState(false);

  /* ---------------- START CAMERA ---------------- */
  useEffect(() => {
    if (!active) return;

    async function startCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        streamRef.current = stream;
        finalVideoRef.current.srcObject = stream;
        finalVideoRef.current.play();
      } catch (err) {
        alert("Camera or microphone access denied");
        console.error(err);
      }
    }

    startCamera();

    return () => stopCamera();
    // eslint-disable-next-line
  }, [active]);

  /* ---------------- STOP CAMERA ---------------- */
  function stopCamera() {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
  }

  /* ---------------- START RECORDING ---------------- */
  function startRecording() {
    if (!streamRef.current) return;

    const recorder = new MediaRecorder(streamRef.current, {
      mimeType: "video/webm"
    });

    const chunks = [];

    recorder.ondataavailable = (e) => {
      if (e.data.size > 0) chunks.push(e.data);
    };

    recorder.onstop = () => {
      const blob = new Blob(chunks, { type: "video/webm" });
      onRecordingReady?.(blob);
    };

    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  }

  /* ---------------- STOP RECORDING ---------------- */
  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  return (
    <div style={{ textAlign: "center" }}>
      <video
        ref={finalVideoRef}
        autoPlay
        muted
        playsInline
        style={{
          width: "260px",
          height: "200px",
          borderRadius: "10px",
          background: "#000"
        }}
      />

      <div style={{ marginTop: "10px" }}>
        {!recording ? (
          <button onClick={startRecording}>⏺ Start Recording</button>
        ) : (
          <button onClick={stopRecording}>⏹ Stop Recording</button>
        )}
      </div>
    </div>
  );
}
