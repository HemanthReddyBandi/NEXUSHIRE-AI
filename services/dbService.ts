import { InterviewSession, HRInvite } from '../types';

const INTERVIEWS_KEY = 'nexushire_interviews';
const INVITES_KEY = 'nexushire_invites';

const getInterviews = (): InterviewSession[] => {
  const stored = localStorage.getItem(INTERVIEWS_KEY);
  return stored ? JSON.parse(stored) : [];
};

const getInvites = (): HRInvite[] => {
  const stored = localStorage.getItem(INVITES_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const DBService = {
  saveInterview: (session: InterviewSession) => {
    const sessions = getInterviews();
    sessions.push(session);
    localStorage.setItem(INTERVIEWS_KEY, JSON.stringify(sessions));
  },

  getInterviewsForCandidate: (candidateId: string) => {
    return getInterviews().filter(i => i.candidateId === candidateId);
  },

  createInvite: (hrId: string, email: string) => {
    const invites = getInvites();
    const newInvite: HRInvite = {
      id: crypto.randomUUID(),
      hrId,
      candidateEmail: email,
      status: 'SENT',
      createdAt: new Date().toISOString()
    };
    invites.push(newInvite);
    localStorage.setItem(INVITES_KEY, JSON.stringify(invites));
    return newInvite;
  },

  getInvitesForHR: (hrId: string) => {
    return getInvites().filter(i => i.hrId === hrId);
  }
};