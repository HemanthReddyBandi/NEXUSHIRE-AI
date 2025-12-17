import React, { useState } from 'react';
import { UserRole } from '../../types';
import { AuthService } from '../../services/authService';

interface RegisterProps {
  onSuccess: () => void;
}

const Register: React.FC<RegisterProps> = ({ onSuccess }) => {
  const [role, setRole] = useState<UserRole>(UserRole.CANDIDATE);
  const [error, setError] = useState('');
  
  // Form State
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [targetRole, setTargetRole] = useState('Software Engineer');
  
  // HR Specific
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [linkedInUrl, setLinkedInUrl] = useState('');
  const [designation, setDesignation] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      if (role === UserRole.CANDIDATE) {
        AuthService.registerCandidate({ name, email, password, targetRole });
      } else {
        if (!companyWebsite || !linkedInUrl) {
          setError('Company Website and LinkedIn are mandatory for verification.');
          return;
        }
        AuthService.registerHR({ 
          name, email, password, 
          companyName, companyWebsite, linkedInUrl, designation 
        });
      }
      onSuccess();
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8 bg-slate-900">
      <div className="max-w-md w-full space-y-8 bg-slate-800 p-8 rounded-xl shadow-2xl border border-slate-700">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            Create an account
          </h2>
          <div className="mt-4 flex justify-center space-x-4">
            <button
              onClick={() => setRole(UserRole.CANDIDATE)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${role === UserRole.CANDIDATE ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              Candidate
            </button>
            <button
              onClick={() => setRole(UserRole.HR)}
              className={`px-4 py-2 rounded-md text-sm font-medium ${role === UserRole.HR ? 'bg-blue-600 text-white' : 'bg-slate-700 text-slate-300'}`}
            >
              HR / Recruiter
            </button>
          </div>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && <div className="text-red-500 text-sm text-center bg-red-900/20 p-2 rounded">{error}</div>}
          
          <div className="rounded-md shadow-sm -space-y-px">
            <input
              type="text"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white rounded-t-md bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              placeholder="Full Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
            <input
              type="email"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white bg-slate-700 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-2"
              placeholder={role === UserRole.HR ? "Official Company Email" : "Email Address"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <input
              type="password"
              required
              className="appearance-none rounded-none relative block w-full px-3 py-2 border border-slate-600 placeholder-slate-400 text-white bg-slate-700 rounded-b-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm mb-4"
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />

            {role === UserRole.CANDIDATE && (
              <select
                className="block w-full px-3 py-2 border border-slate-600 rounded-md text-white bg-slate-700 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                value={targetRole}
                onChange={(e) => setTargetRole(e.target.value)}
              >
                <option value="Software Engineer">Software Engineer</option>
                <option value="Data Scientist">Data Scientist</option>
                <option value="Product Manager">Product Manager</option>
                <option value="UX Designer">UX Designer</option>
              </select>
            )}

            {role === UserRole.HR && (
              <div className="space-y-2 mt-4">
                <input type="text" required placeholder="Company Name" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" value={companyName} onChange={e => setCompanyName(e.target.value)} />
                <input type="url" required placeholder="Company Website" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" value={companyWebsite} onChange={e => setCompanyWebsite(e.target.value)} />
                <input type="url" required placeholder="LinkedIn Profile URL" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" value={linkedInUrl} onChange={e => setLinkedInUrl(e.target.value)} />
                <input type="text" required placeholder="Designation" className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded text-white" value={designation} onChange={e => setDesignation(e.target.value)} />
                <p className="text-xs text-yellow-500 mt-2">
                  * HR accounts require manual verification by Admin before access is granted.
                </p>
              </div>
            )}
          </div>

          <div>
            <button
              type="submit"
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Sign Up as {role === UserRole.CANDIDATE ? 'Candidate' : 'HR'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Register;