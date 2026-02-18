import { UserProfile } from '../types';

const API_URL = 'http://localhost:3000/api';

// --- MOCK BACKEND HELPERS (Fallback) ---
const STORAGE_KEY_USERS = 'heaithy_db_users';

const getMockUsers = (): any[] => {
  const data = localStorage.getItem(STORAGE_KEY_USERS);
  return data ? JSON.parse(data) : [];
};

const saveMockUser = (user: any) => {
  const users = getMockUsers();
  const existingIndex = users.findIndex(u => u.email === user.email);
  if (existingIndex >= 0) {
    users[existingIndex] = user;
  } else {
    users.push(user);
  }
  localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(users));
};

const mockDelay = (ms = 500) => new Promise(resolve => setTimeout(resolve, ms));

// --- API SERVICE WITH FALLBACK ---

export const api = {
  signup: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${API_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Signup failed');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using Mock Fallback:", err);
      await mockDelay();
      
      const users = getMockUsers();
      if (users.find(u => u.email === email)) throw new Error('User already exists (Mock)');
      
      const newUser = {
        email,
        password,
        profile: {
          name,
          email,
          age: 25,
          gender: 'Male',
          height: 175,
          weight: 70,
          goal: 'Lose Weight',
          activityLevel: 'Moderate',
          dietaryPreference: 'None',
          allergies: '',
          isPremium: false,
          paymentStatus: 'none',
          lastTransactionId: ''
        }
      };
      saveMockUser(newUser);
      return { user: newUser.profile };
    }
  },

  login: async (email: string, password: string) => {
    // Admin check fallback for Mock Mode
    if (email === 'admin@admin.com' && password === 'admin123') {
       // Try server first
       try {
         const res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password }),
         });
         if (res.ok) return await res.json();
       } catch (e) { /* ignore */ }
       
       // Fallback Admin
       return { user: { name: 'Admin', email: 'admin@admin.com', isAdmin: true } };
    }

    try {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Login failed');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using Mock Fallback:", err);
      await mockDelay();
      
      const users = getMockUsers();
      const user = users.find(u => u.email === email && u.password === password);
      if (!user) throw new Error('Invalid credentials (Mock)');
      
      return { user: user.profile };
    }
  },

  submitPayment: async (email: string, transactionId: string) => {
    try {
      const res = await fetch(`${API_URL}/payment/submit`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, transactionId }),
      });
      if (!res.ok) throw new Error('Submission failed');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using Mock Fallback:", err);
      await mockDelay();
      
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('User not found (Mock)');
      
      user.profile.paymentStatus = 'pending';
      user.profile.lastTransactionId = transactionId;
      saveMockUser(user);
      
      return { success: true, user: user.profile };
    }
  },

  redeemCode: async (email: string, code: string) => {
    try {
      const res = await fetch(`${API_URL}/payment/redeem`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code }),
      });
      if (!res.ok) throw new Error((await res.json()).error || 'Invalid code');
      return await res.json();
    } catch (err) {
      console.warn("Backend unavailable, using Mock Fallback:", err);
      await mockDelay();
      
      const validCodes = ['HEALTHY-PRO-2024', 'ADMIN-TEST', 'PREMIUM24'];
      
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (!user) throw new Error('User not found (Mock)');
      
      if (validCodes.includes(code)) {
        user.profile.isPremium = true;
        user.profile.paymentStatus = 'approved';
        saveMockUser(user);
        return { success: true, user: user.profile };
      } else {
        throw new Error('Invalid or expired license key (Mock)');
      }
    }
  },

  syncProfile: async (email: string, profile: UserProfile) => {
    try {
      fetch(`${API_URL}/user/sync`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, profile }),
      }).catch(() => {});
    } catch (err) {
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        user.profile = { ...user.profile, ...profile };
        saveMockUser(user);
      }
    }
  },

  // --- ADMIN API ---
  getAdminUsers: async () => {
    try {
      const res = await fetch(`${API_URL}/admin/users`);
      if (res.ok) return await res.json();
      throw new Error("Failed");
    } catch (err) {
      // Mock Fallback
      return getMockUsers().map(u => ({
        email: u.email,
        name: u.profile.name,
        paymentStatus: u.profile.paymentStatus,
        lastTransactionId: u.profile.lastTransactionId,
        isPremium: u.profile.isPremium
      }));
    }
  },

  approveUser: async (email: string) => {
    try {
      await fetch(`${API_URL}/admin/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      return true;
    } catch (err) {
      // Mock Fallback
      const users = getMockUsers();
      const user = users.find(u => u.email === email);
      if (user) {
        user.profile.isPremium = true;
        user.profile.paymentStatus = 'approved';
        saveMockUser(user);
      }
      return true;
    }
  }
};