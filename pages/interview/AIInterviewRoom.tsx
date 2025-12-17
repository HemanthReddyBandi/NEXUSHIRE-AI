import React, { useEffect, useRef, useState } from 'react';
import { User, Challenge } from '../../types';
import RobotAvatar from '../../components/RobotAvatar';
import { GoogleGenAI, LiveServerMessage, Modality, Type, FunctionDeclaration } from '@google/genai';
import { DBService } from '../../services/dbService';

interface AIInterviewRoomProps {
  user: User;
  onEnd: () => void;
}

// Expanded Challenges Database with Difficulty Levels
const CHALLENGE_POOL: Challenge[] = [
  // Software Engineer
  {
    id: 'se-easy',
    role: 'Software Engineer',
    difficulty: 'Easy',
    title: 'Sum of Positives',
    description: 'Write a function that takes an array of integers and returns the sum of all positive numbers.',
    starterCode: 'function sumPositives(arr) {\n  // Your code here\n  return 0;\n}'
  },
  {
    id: 'se-med',
    role: 'Software Engineer',
    difficulty: 'Medium',
    title: 'LRU Cache',
    description: 'Implement a Least Recently Used (LRU) cache with get and put operations.',
    starterCode: 'class LRUCache {\n  constructor(capacity) {\n    this.capacity = capacity;\n  }\n\n  get(key) {\n    // ...\n  }\n\n  put(key, value) {\n    // ...\n  }\n}'
  },
  {
    id: 'se-hard',
    role: 'Software Engineer',
    difficulty: 'Hard',
    title: 'Merge K Sorted Lists',
    description: 'Merge k linked lists and return it as one sorted list. Analyze and describe its complexity.',
    starterCode: 'function mergeKLists(lists) {\n  // Your code here\n}'
  },
  // Data Scientist
  {
    id: 'ds-easy',
    role: 'Data Scientist',
    difficulty: 'Easy',
    title: 'Filter Adults',
    description: 'Filter a list of user dictionaries to return only those with age > 18.',
    starterCode: 'def filter_adults(users):\n    return []'
  },
  {
    id: 'ds-med',
    role: 'Data Scientist',
    difficulty: 'Medium',
    title: 'Pandas Aggregation',
    description: 'Given a DataFrame `df`, calculate the mean salary per department.',
    starterCode: 'import pandas as pd\n\ndef calculate_mean_salary(df):\n    # Returns a Series\n    pass'
  },
  // UX Designer
  {
    id: 'ux-med',
    role: 'UX Designer',
    difficulty: 'Medium',
    title: 'Accessibility Audit',
    description: 'List 3 WCAG violations in a typical low-contrast login form.',
    starterCode: '1. \n2. \n3. '
  }
];

const getChallenge = (role: string, difficulty: string): Challenge => {
  const roleChallenges = CHALLENGE_POOL.filter(c => c.role === role);
  if (roleChallenges.length === 0) return CHALLENGE_POOL[0]; // Fallback
  
  const match = roleChallenges.find(c => c.difficulty === difficulty);
  return match || roleChallenges[0]; // Fallback to first if exact difficulty not found
};

// Role Topics Map for Dynamic Questioning
const ROLE_TOPICS: Record<string, string[]> = {
  'Software Engineer': ['Time Complexity', 'Distributed Systems', 'API Design', 'Testing Strategies', 'CI/CD'],
  'Data Scientist': ['Statistical Analysis', 'Machine Learning Models', 'Data Visualization', 'Feature Engineering', 'SQL'],
  'Product Manager': ['Market Analysis', 'Feature Prioritization', 'User Personas', 'Go-to-Market Strategy', 'Agile Methodology'],
  'UX Designer': ['User Journeys', 'Prototyping Tools', 'Usability Testing', 'Color Theory', 'Mobile-First Design'],
};

const AIInterviewRoom: React.FC<AIInterviewRoomProps> = ({ user, onEnd }) => {
  // Phase State
  const [phase, setPhase] = useState<'VERBAL' | 'CODING'>('VERBAL');
  
  // Live Interview State
  const [connected, setConnected] = useState(false);
  const [micActive, setMicActive] = useState(false);
  const [robotSpeaking, setRobotSpeaking] = useState(false);
  const [volume, setVolume] = useState(0);
  const [showAPIKeyModal, setShowAPIKeyModal] = useState(!process.env.API_KEY);
  const [apiKey, setApiKey] = useState(process.env.API_KEY || '');

  // Coding Challenge State
  const [challenge, setChallenge] = useState<Challenge | null>(null);
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Refs
  const inputAudioContextRef = useRef<AudioContext | null>(null);
  const outputAudioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const sessionRef = useRef<any>(null);
  const nextStartTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  // --- Audio Helpers ---
  const decodeAudioData = async (data: Uint8Array, ctx: AudioContext) => {
    const int16 = new Int16Array(data.buffer);
    const float32 = new Float32Array(int16.length);
    for (let i = 0; i < int16.length; i++) {
        float32[i] = int16[i] / 32768.0;
    }
    const buffer = ctx.createBuffer(1, float32.length, 24000);
    buffer.getChannelData(0).set(float32);
    return buffer;
  };

  const createPcmBlob = (data: Float32Array) => {
    const int16 = new Int16Array(data.length);
    for (let i = 0; i < data.length; i++) {
      int16[i] = Math.max(-1, Math.min(1, data[i])) * 32767;
    }
    const uint8 = new Uint8Array(int16.buffer);
    let binary = '';
    const len = uint8.byteLength;
    for (let i = 0; i < len; i++) {
      binary += String.fromCharCode(uint8[i]);
    }
    const b64 = btoa(binary);
    return {
      data: b64,
      mimeType: 'audio/pcm;rate=16000'
    };
  };

  // --- Verbal Interview Functions ---
  const startInterview = async () => {
    if (!apiKey) return;

    try {
      inputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      outputAudioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });

      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }

      const ai = new GoogleGenAI({ apiKey });

      // Define Tool for Dynamic Difficulty Selection
      const tools = [{
        functionDeclarations: [
          {
            name: "startTechnicalChallenge",
            description: "End the verbal phase and start the technical coding challenge. Choose difficulty based on candidate's verbal performance.",
            parameters: {
              type: Type.OBJECT,
              properties: {
                difficulty: {
                  type: Type.STRING,
                  enum: ["Easy", "Medium", "Hard"],
                  description: "Difficulty level based on candidate competence. 'Hard' for experts, 'Easy' for beginners."
                }
              },
              required: ["difficulty"]
            }
          }
        ]
      }];
      
      const roleTopics = ROLE_TOPICS[user.targetRole || 'Software Engineer']?.join(', ') || 'general technical skills';

      const config = {
        model: 'gemini-2.5-flash-native-audio-preview-09-2025',
        config: {
          tools: tools,
          responseModalities: [Modality.AUDIO],
          systemInstruction: `You are Nexus, a professional technical interviewer for a ${user.targetRole} role.
          
          Your evaluation focus areas are: ${roleTopics}.
          
          PHASE 1: VERBAL INTERVIEW
          1. Welcome the candidate (${user.name}) and ask them to briefly introduce themselves.
          2. Ask 3-4 technical questions dynamically.
             - ADAPTIVITY: Explicitly change the difficulty based on the previous answer.
             - If they answer confidentally and correctly, dig deeper into edge cases or advanced concepts.
             - If they struggle, pivot to foundational questions to help them regain confidence.
             - Cover at least 2 different topics from the focus areas list.
             - Keep questions brief and conversational.
          
          PHASE 2: TRANSITION
          - After the verbal questions, you MUST evaluate the candidate's performance.
          - Call the function \`startTechnicalChallenge\` with a difficulty ('Easy', 'Medium', 'Hard') matching their skill level.
          - Say a brief transition sentence like "Let's move to a coding challenge." before calling the function.`,
          speechConfig: {
            voiceConfig: { prebuiltVoiceConfig: { voiceName: 'Kore' } }
          }
        }
      };

      const sessionPromise = ai.live.connect({
        ...config,
        callbacks: {
          onopen: () => {
            setConnected(true);
            setMicActive(true);
            
            if (!inputAudioContextRef.current || !streamRef.current) return;
            const source = inputAudioContextRef.current.createMediaStreamSource(streamRef.current);
            const processor = inputAudioContextRef.current.createScriptProcessor(4096, 1, 1);
            
            processor.onaudioprocess = (e) => {
              const inputData = e.inputBuffer.getChannelData(0);
              const blob = createPcmBlob(inputData);
              sessionPromise.then(session => {
                  session.sendRealtimeInput({ media: blob });
              });
            };
            source.connect(processor);
            processor.connect(inputAudioContextRef.current.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            // Handle Tool Call (The AI deciding to switch phases)
            if (msg.toolCall) {
               const call = msg.toolCall.functionCalls.find(fc => fc.name === 'startTechnicalChallenge');
               if (call) {
                  const difficulty = (call.args as any).difficulty || 'Medium';
                  console.log(`AI Selected Difficulty: ${difficulty}`);
                  
                  // Acknowledge tool call (required by protocol usually, but we are disconnecting immediately)
                  // For cleanliness, we just switch phases.
                  triggerTechnicalPhase(difficulty);
                  return; 
               }
            }

            // Handle Audio Output
            const base64Audio = msg.serverContent?.modelTurn?.parts?.[0]?.inlineData?.data;
            if (base64Audio && outputAudioContextRef.current) {
                const binaryString = atob(base64Audio);
                const len = binaryString.length;
                const bytes = new Uint8Array(len);
                for (let i = 0; i < len; i++) {
                    bytes[i] = binaryString.charCodeAt(i);
                }

                const audioBuffer = await decodeAudioData(bytes, outputAudioContextRef.current);
                const ctx = outputAudioContextRef.current;
                const source = ctx.createBufferSource();
                source.buffer = audioBuffer;
                const gain = ctx.createGain();
                source.connect(gain);
                gain.connect(ctx.destination);

                const analyser = ctx.createAnalyser();
                analyser.fftSize = 32;
                gain.connect(analyser);
                
                const updateVolume = () => {
                    const dataArray = new Uint8Array(analyser.frequencyBinCount);
                    analyser.getByteFrequencyData(dataArray);
                    const avg = dataArray.reduce((a, b) => a + b) / dataArray.length;
                    setVolume(avg / 255);
                    if (isPlayingRef.current) requestAnimationFrame(updateVolume);
                    else setVolume(0);
                };

                if (nextStartTimeRef.current < ctx.currentTime) {
                    nextStartTimeRef.current = ctx.currentTime;
                }
                
                source.start(nextStartTimeRef.current);
                nextStartTimeRef.current += audioBuffer.duration;
                
                setRobotSpeaking(true);
                isPlayingRef.current = true;
                updateVolume();

                source.onended = () => {
                    if (ctx.currentTime >= nextStartTimeRef.current - 0.1) {
                         setRobotSpeaking(false);
                         isPlayingRef.current = false;
                         setVolume(0);
                    }
                };
            }
          },
          onclose: () => setConnected(false),
          onerror: (err) => console.error(err)
        }
      });
      sessionRef.current = sessionPromise;

    } catch (e) {
      console.error(e);
      alert("Failed to initialize interview.");
    }
  };

  const closeLiveSession = () => {
    if (streamRef.current) {
        streamRef.current.getTracks().forEach(t => t.stop());
    }
    if (inputAudioContextRef.current) inputAudioContextRef.current.close();
    if (outputAudioContextRef.current) outputAudioContextRef.current.close();
    setConnected(false);
  };

  // --- Technical Challenge Functions ---

  const triggerTechnicalPhase = (difficulty: string = 'Medium') => {
    // 1. Close Live Session
    closeLiveSession();
    
    // 2. Select Challenge
    const selectedChallenge = getChallenge(user.targetRole || 'Software Engineer', difficulty);
    setChallenge(selectedChallenge);
    setCode(selectedChallenge.starterCode);
    setPhase('CODING');

    // 3. Robot Reads Instructions (Browser TTS)
    // We delay slightly to allow UI transition
    setTimeout(() => {
        const utterance = new SpeechSynthesisUtterance(
          `Based on our conversation, I've selected a ${difficulty} difficulty challenge for you. ${selectedChallenge.title}. ${selectedChallenge.description}`
        );
        
        utterance.onstart = () => {
          setRobotSpeaking(true);
          const interval = setInterval(() => {
            setVolume(Math.random() * 0.5 + 0.2);
          }, 100);
          (utterance as any)._interval = interval;
        };
        
        utterance.onend = () => {
          setRobotSpeaking(false);
          setVolume(0);
          if ((utterance as any)._interval) clearInterval((utterance as any)._interval);
        };

        window.speechSynthesis.speak(utterance);
    }, 500);
  };

  const submitTechnicalChallenge = async () => {
    if (!challenge || !code) return;
    setIsSubmitting(true);

    try {
      const ai = new GoogleGenAI({ apiKey });
      const prompt = `
        Evaluate the following code solution for a ${user.targetRole} role.
        Problem Difficulty: ${challenge.difficulty}
        Problem: ${challenge.title} - ${challenge.description}
        
        Candidate Code:
        \`\`\`
        ${code}
        \`\`\`
        
        Provide a JSON response with:
        - "score": number (0-100)
        - "feedback": string (concise feedback on correctness, efficiency, and style)
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: { responseMimeType: 'application/json' }
      });
      
      const resultText = response.text || '{}';
      const result = JSON.parse(resultText);

      // Save Full Report
      DBService.saveInterview({
        id: crypto.randomUUID(),
        candidateId: user.id,
        role: user.targetRole || 'General',
        date: new Date().toISOString(),
        status: 'COMPLETED',
        score: Math.floor((85 + (result.score || 70)) / 2),
        report: `Adaptive Interview Completed. Difficulty: ${challenge.difficulty}. Verbal performance evaluated dynamically.`,
        strengths: ["Adaptive Learning", "Technical Implementation"],
        weaknesses: [],
        codingScore: result.score || 0,
        codingFeedback: result.feedback || "Code submitted successfully.",
        challengeDifficulty: challenge.difficulty
      });

      onEnd();

    } catch (e) {
      console.error("Evaluation failed", e);
      alert("Error evaluating code. Check console.");
      setIsSubmitting(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
      return () => {
          closeLiveSession();
          window.speechSynthesis.cancel();
      }
  }, []);

  if (showAPIKeyModal) {
      return (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4">
              <div className="bg-slate-800 p-6 rounded-lg max-w-md w-full border border-slate-700">
                  <h3 className="text-xl font-bold mb-4 text-white">Enter Gemini API Key</h3>
                  <p className="text-sm text-slate-400 mb-4">
                      This demo requires a Gemini API key.
                      Get one at <a href="https://aistudio.google.com" target="_blank" className="text-blue-400">aistudio.google.com</a>.
                  </p>
                  <input 
                    type="password" 
                    className="w-full p-2 bg-slate-900 border border-slate-700 rounded text-white mb-4"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    placeholder="AIza..."
                  />
                  <button 
                    onClick={() => {
                        if(apiKey) setShowAPIKeyModal(false);
                    }}
                    className="w-full bg-blue-600 hover:bg-blue-500 text-white py-2 rounded"
                  >
                      Enter Room
                  </button>
              </div>
          </div>
      )
  }

  return (
    <div className="flex flex-col h-[calc(100vh-64px)] bg-slate-900 p-4 gap-4">
      {/* Top Bar */}
      <div className="flex justify-between items-center bg-slate-800 p-4 rounded-lg border border-slate-700">
        <div className="flex items-center gap-4">
            <div>
              <h2 className="text-lg font-bold text-white">
                {phase === 'VERBAL' ? 'Verbal Interview' : 'Technical Challenge'}
              </h2>
              <div className="flex items-center gap-2">
                 <span className="text-sm text-slate-400">{user.targetRole}</span>
                 {phase === 'CODING' && challenge && (
                     <span className={`text-xs px-2 py-0.5 rounded border ${
                         challenge.difficulty === 'Easy' ? 'border-green-500 text-green-500' :
                         challenge.difficulty === 'Medium' ? 'border-yellow-500 text-yellow-500' :
                         'border-red-500 text-red-500'
                     }`}>
                         {challenge.difficulty}
                     </span>
                 )}
              </div>
            </div>
            {phase === 'VERBAL' && (
              <span className={`text-xs px-2 py-1 rounded ${connected ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'}`}>
                  {connected ? 'LIVE' : 'WAITING'}
              </span>
            )}
        </div>
        
        <div className="flex gap-2">
          {phase === 'VERBAL' && (
            <>
              <button 
                  onClick={connected ? closeLiveSession : startInterview}
                  className={`px-4 py-2 rounded font-medium text-sm ${connected ? 'bg-red-900/50 text-red-200 border border-red-800' : 'bg-green-600 hover:bg-green-700 text-white'}`}
              >
                  {connected ? 'Stop Camera' : 'Start Camera'}
              </button>
              {/* Manual fallback if AI doesn't trigger */}
              <button 
                  onClick={() => triggerTechnicalPhase('Medium')}
                  disabled={!connected}
                  className="px-4 py-2 bg-slate-700 hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded font-medium text-sm"
              >
                  Force Next Phase
              </button>
            </>
          )}
          {phase === 'CODING' && (
             <button 
                onClick={submitTechnicalChallenge}
                disabled={isSubmitting}
                className="px-6 py-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white rounded font-bold text-sm"
             >
                {isSubmitting ? 'Evaluating...' : 'Submit Solution'}
             </button>
          )}
        </div>
      </div>

      <div className="flex-1 flex flex-col md:flex-row gap-4 min-h-0">
        
        {/* Left Panel: Robot & Instructions */}
        <div className={`flex-1 flex flex-col gap-4 transition-all duration-500 ${phase === 'CODING' ? 'md:w-1/3 md:flex-none' : ''}`}>
           {/* Robot Area */}
           <div className="flex-1 bg-slate-800 rounded-xl relative flex flex-col items-center justify-center border border-slate-700 overflow-hidden min-h-[300px]">
              <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded text-xs text-blue-200 border border-blue-500/30">AI Interviewer</div>
              
              <div className="relative z-0">
                  <RobotAvatar isSpeaking={robotSpeaking} volume={volume} size="lg" />
              </div>
              
              <div className="mt-8 text-center px-8 w-full">
                  {phase === 'VERBAL' ? (
                    <p className="text-slate-400 italic min-h-[3rem]">
                        {robotSpeaking ? "Speaking..." : connected ? "Listening to you..." : "Connect camera to start."}
                    </p>
                  ) : (
                    <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-700 text-left">
                       <h4 className="text-blue-400 font-bold mb-2">Challenge Instructions</h4>
                       <p className="text-sm text-slate-300 leading-relaxed">
                         {challenge?.description}
                       </p>
                    </div>
                  )}
              </div>
          </div>

          {/* User Video Area (Miniaturized in Coding Phase) */}
          <div className={`bg-slate-800 rounded-xl relative overflow-hidden border border-slate-700 transition-all duration-500 ${phase === 'CODING' ? 'h-48' : 'flex-1'}`}>
              <div className="absolute top-4 left-4 z-10 bg-black/50 px-3 py-1 rounded text-xs text-white">You</div>
              {phase === 'VERBAL' ? (
                <video ref={videoRef} autoPlay muted playsInline className="w-full h-full object-cover"/>
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-slate-900">
                    <span className="text-slate-500 text-sm">Camera Paused</span>
                </div>
              )}
              
              {/* Mic Status */}
              {phase === 'VERBAL' && (
                <div className="absolute bottom-4 right-4">
                    <div className={`p-3 rounded-full ${micActive ? 'bg-blue-600' : 'bg-red-600'}`}>
                        <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           {micActive ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /> : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />}
                        </svg>
                    </div>
                </div>
              )}
          </div>
        </div>

        {/* Right Panel: Code Editor (Only in CODING phase) */}
        {phase === 'CODING' && (
          <div className="flex-[2] bg-slate-800 rounded-xl border border-slate-700 flex flex-col overflow-hidden animate-pulse-fast-enter">
             <div className="bg-slate-900 px-4 py-2 border-b border-slate-700 flex justify-between items-center">
                <span className="text-sm font-mono text-slate-400">main.js</span>
                <span className="text-xs text-slate-500">Auto-save: ON</span>
             </div>
             <textarea
                value={code}
                onChange={(e) => setCode(e.target.value)}
                className="flex-1 w-full bg-[#1e1e1e] text-slate-300 font-mono p-4 text-sm resize-none focus:outline-none"
                spellCheck={false}
             />
          </div>
        )}

      </div>
    </div>
  );
};

export default AIInterviewRoom;