// src/hr/hrMatchStore.js

let candidateQueue = {};
let hrQueue = {};

export function joinCandidateQueue(role, callback) {
  if (!candidateQueue[role]) candidateQueue[role] = [];
  candidateQueue[role].push(callback);
  tryMatch(role);
}

export function joinHRQueue(role, callback) {
  if (!hrQueue[role]) hrQueue[role] = [];
  hrQueue[role].push(callback);
  tryMatch(role);
}
setMode("hr_room");

function tryMatch(role) {
  if (
    candidateQueue[role]?.length > 0 &&
    hrQueue[role]?.length > 0
  ) {
    const candidate = candidateQueue[role].shift();
    const hr = hrQueue[role].shift();

    const roomId = Math.random().toString(36).substring(2, 8).toUpperCase();

    candidate(roomId);
    hr(roomId);
  }
}
