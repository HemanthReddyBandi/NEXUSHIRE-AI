import React, { useState, useEffect } from 'react';
import { User, UserRole, HRStatus } from './types';
import { AuthService } from './services/authService';
import { DBService } from './services/dbService';
import Layout from './components/Layout';
import Register from './pages/auth/Register';
import AIInterviewRoom from './pages/interview/AIInterviewRoom';

// Simple Router Component since we can't use react-router-dom easily in this snippet format without multiple files setup
// In a real app, use react-router-dom

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [view, setView] = useState<'LOGIN' | 'REGISTER' | 'DASHBOARD' | 'INTERVIEW' | 'ADMIN_PANEL'>('LOGIN');
  
  // Login State
  const [email, setEmail] = useState('');
  
  useEffect(() => {
    const currentUser = AuthService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
      setView('DASHBOARD');
    }
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const loggedInUser = AuthService.login(email);
    if (loggedInUser) {
      setUser(loggedInUser);
      setView('DASHBOARD');
    } else {
      alert('User not found. Try registering or use admin@nexushire.ai');
    }
  };

  const handleLogout = () => {
    AuthService.logout();
    setUser(null);
    setView('LOGIN');
  };

  // ------------------- RENDER PAGES -------------------

  // 1. LOGIN PAGE
  if (!user && view === 'LOGIN') {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
          <h1 className="text-3xl font-bold text-center text-white mb-8">NexusHire AI</h1>
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-slate-400">Email Address</label>
              <input 
                type="email" 
                className="mt-1 block w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white focus:ring-blue-500 focus:border-blue-500"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@nexushire.ai (pwd: admin123)"
              />
            </div>
            <button type="submit" className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              Sign In
            </button>
          </form>
          <div className="mt-4 text-center">
            <button onClick={() => setView('REGISTER')} className="text-sm text-blue-400 hover:text-blue-300">
              Don't have an account? Register
            </button>
          </div>
        </div>
      </div>
    );
  }

  // 2. REGISTER PAGE
  if (!user && view === 'REGISTER') {
    return <Register onSuccess={() => setView('LOGIN')} />;
  }

  // 3. MAIN APP LAYOUT
  if (user) {
    return (
      <Layout onLogout={handleLogout}>
        
        {/* --- HR PENDING SCREEN --- */}
        {user.role === UserRole.HR && user.hrStatus === HRStatus.PENDING && (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
            <div className="bg-yellow-500/10 p-4 rounded-full mb-4">
               <svg className="w-16 h-16 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Verification Pending</h2>
            <p className="text-slate-400 max-w-md">
              Your HR account is currently under review. Our admins are verifying your company details ({user.companyName}) and LinkedIn profile. 
            </p>
            <p className="text-slate-500 mt-4 text-sm">Please check back later.</p>
          </div>
        )}

        {/* --- HR REJECTED SCREEN --- */}
        {user.role === UserRole.HR && user.hrStatus === HRStatus.REJECTED && (
          <div className="flex flex-col items-center justify-center h-[80vh] text-center p-8">
            <h2 className="text-2xl font-bold text-red-500 mb-2">Account Rejected</h2>
            <p className="text-slate-400">Your verification failed. Contact support.</p>
          </div>
        )}

        {/* --- ADMIN DASHBOARD --- */}
        {user.role === UserRole.ADMIN && view === 'DASHBOARD' && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <h2 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h2>
            <div className="bg-slate-800 shadow overflow-hidden sm:rounded-md border border-slate-700">
              <ul className="divide-y divide-slate-700">
                <li className="px-4 py-4 sm:px-6 bg-slate-900/50">
                    <h3 className="text-lg font-medium text-white">Pending Approvals</h3>
                </li>
                {AuthService.getAllHRs().map((hr) => (
                  <li key={hr.id} className="px-4 py-4 sm:px-6 hover:bg-slate-700/50 transition">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm font-medium text-blue-400 truncate">{hr.name}</p>
                        <p className="text-sm text-slate-400">{hr.email}</p>
                        <p className="text-xs text-slate-500 mt-1">{hr.companyName} - {hr.designation}</p>
                        <a href={hr.companyWebsite} target="_blank" className="text-xs text-blue-500 hover:underline mr-2">Website</a>
                        <a href={hr.linkedInUrl} target="_blank" className="text-xs text-blue-500 hover:underline">LinkedIn</a>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                          ${hr.hrStatus === 'APPROVED' ? 'bg-green-100 text-green-800' : 
                            hr.hrStatus === 'PENDING' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'}`}>
                          {hr.hrStatus}
                        </span>
                        {hr.hrStatus === 'PENDING' && (
                          <>
                            <button 
                              onClick={() => { AuthService.updateHRStatus(hr.id, HRStatus.APPROVED); setView('DASHBOARD'); /* Force rerender hack */ window.location.reload(); }}
                              className="ml-2 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded"
                            >
                              Approve
                            </button>
                            <button 
                              onClick={() => { AuthService.updateHRStatus(hr.id, HRStatus.REJECTED); window.location.reload(); }}
                              className="ml-2 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded"
                            >
                              Reject
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}

        {/* --- HR APPROVED DASHBOARD --- */}
        {user.role === UserRole.HR && user.hrStatus === HRStatus.APPROVED && view === 'DASHBOARD' && (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
             <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white">HR Recruitment Portal</h2>
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">Invite Candidate</button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm">Active Candidates</h3>
                    <p className="text-3xl font-bold text-white mt-2">12</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm">Interviews Scheduled</h3>
                    <p className="text-3xl font-bold text-white mt-2">5</p>
                </div>
                <div className="bg-slate-800 p-6 rounded-xl border border-slate-700">
                    <h3 className="text-slate-400 text-sm">Avg. AI Score</h3>
                    <p className="text-3xl font-bold text-white mt-2">84%</p>
                </div>
             </div>

             <h3 className="text-xl font-bold text-white mb-4">Recent AI Screening Reports</h3>
             <div className="bg-slate-800 overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg border border-slate-700">
                <table className="min-w-full divide-y divide-slate-700">
                    <thead className="bg-slate-900">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Candidate</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Score</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-slate-300 uppercase tracking-wider">Status</th>
                        </tr>
                    </thead>
                    <tbody className="bg-slate-800 divide-y divide-slate-700">
                        <tr>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-white">John Doe</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-300">Software Engineer</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-green-400 font-bold">92/100</td>
                            <td className="px-6 py-4 whitespace-nowrap"><span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">Completed</span></td>
                        </tr>
                    </tbody>
                </table>
             </div>
           </div>
        )}

        {/* --- CANDIDATE DASHBOARD --- */}
        {user.role === UserRole.CANDIDATE && view === 'DASHBOARD' && (
           <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
              <div className="bg-gradient-to-r from-blue-900 to-slate-800 rounded-2xl p-8 mb-8 border border-blue-800">
                  <h2 className="text-3xl font-bold text-white mb-2">Welcome, {user.name}</h2>
                  <p className="text-blue-200 mb-6">Target Role: {user.targetRole}</p>
                  <button 
                    onClick={() => setView('INTERVIEW')}
                    className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-2 -ml-1 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    Start AI Mock Interview
                  </button>
              </div>

              <h3 className="text-xl font-bold text-white mb-4">Your Performance History</h3>
              <div className="grid gap-4">
                  {DBService.getInterviewsForCandidate(user.id).map(interview => (
                      <div key={interview.id} className="bg-slate-800 p-6 rounded-lg border border-slate-700 flex justify-between items-center">
                          <div>
                              <p className="font-bold text-white">{interview.role} Interview</p>
                              <p className="text-sm text-slate-400">{new Date(interview.date).toLocaleDateString()}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-2xl font-bold text-blue-400">{interview.score}/100</p>
                              <p className="text-xs text-slate-500">Score</p>
                          </div>
                      </div>
                  ))}
                  {DBService.getInterviewsForCandidate(user.id).length === 0 && (
                      <p className="text-slate-500 italic">No interviews taken yet.</p>
                  )}
              </div>
           </div>
        )}

        {/* --- INTERVIEW ROOM --- */}
        {view === 'INTERVIEW' && user && (
            <AIInterviewRoom user={user} onEnd={() => setView('DASHBOARD')} />
        )}

      </Layout>
    );
  }

  return null;
};

export default App;