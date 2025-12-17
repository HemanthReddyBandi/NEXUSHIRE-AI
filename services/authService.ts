import { User, UserRole, HRStatus } from '../types';

// Keys for localStorage
const USERS_KEY = 'nexushire_users';
const CURRENT_USER_KEY = 'nexushire_current_user';

// Mock Admin Account
const ADMIN_USER: User = {
  id: 'admin-1',
  name: 'System Administrator',
  email: 'admin@nexushire.ai',
  role: UserRole.ADMIN,
  password: 'admin123'
};

const getStoredUsers = (): User[] => {
  const stored = localStorage.getItem(USERS_KEY);
  return stored ? JSON.parse(stored) : [ADMIN_USER];
};

const saveUsers = (users: User[]) => {
  localStorage.setItem(USERS_KEY, JSON.stringify(users));
};

export const AuthService = {
  getCurrentUser: (): User | null => {
    const stored = localStorage.getItem(CURRENT_USER_KEY);
    return stored ? JSON.parse(stored) : null;
  },

  login: (email: string): User | null => {
    const users = getStoredUsers();
    const user = users.find(u => u.email === email);
    if (user) {
      localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
      return user;
    }
    return null;
  },

  logout: () => {
    localStorage.removeItem(CURRENT_USER_KEY);
  },

  registerCandidate: (data: Partial<User>): User => {
    const users = getStoredUsers();
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }
    const newUser: User = {
      id: crypto.randomUUID(),
      role: UserRole.CANDIDATE,
      name: data.name!,
      email: data.email!,
      password: data.password!,
      targetRole: data.targetRole || 'Software Engineer'
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  registerHR: (data: Partial<User>): User => {
    const users = getStoredUsers();
    if (users.find(u => u.email === data.email)) {
      throw new Error('User already exists');
    }
    
    // Validate email domain
    const blockedDomains = ['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'];
    const domain = data.email!.split('@')[1];
    if (blockedDomains.includes(domain)) {
      throw new Error('Please use an official company email address.');
    }

    const newUser: User = {
      id: crypto.randomUUID(),
      role: UserRole.HR,
      hrStatus: HRStatus.PENDING,
      name: data.name!,
      email: data.email!,
      password: data.password!,
      companyName: data.companyName,
      companyWebsite: data.companyWebsite,
      linkedInUrl: data.linkedInUrl,
      designation: data.designation
    };
    users.push(newUser);
    saveUsers(users);
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(newUser));
    return newUser;
  },

  // Admin Methods
  getAllHRs: (): User[] => {
    return getStoredUsers().filter(u => u.role === UserRole.HR);
  },

  updateHRStatus: (hrId: string, status: HRStatus) => {
    const users = getStoredUsers();
    const index = users.findIndex(u => u.id === hrId);
    if (index !== -1) {
      users[index].hrStatus = status;
      saveUsers(users);
    }
  }
};