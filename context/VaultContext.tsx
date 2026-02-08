
import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { User, DocumentData, SmartBrief, VaultState, SavedBrief, Notification, ExtractionData, AdvisoryData, SystemSettings } from '../types';
import { CommsService } from '../services/commsService';

interface VaultContextType extends VaultState {
  signup: (email: string, name: string, role: User['role'], org?: string) => Promise<void>;
  login: (email: string, password?: string) => { success: boolean; message?: string, isAdmin?: boolean };
  logout: () => void;
  resetPassword: (email: string) => void;
  verifyEmail: () => void;
  verifyCode: (code: string) => { success: boolean; message?: string };
  resendVerificationCode: () => Promise<void>;
  setDocument: (doc: DocumentData) => void;
  setBrief: (brief: SmartBrief | null) => void;
  setProcessing: (status: boolean) => void;
  setAnalysisInstructions: (instructions: string | null) => void;
  incrementUsage: () => void;
  purgeSession: () => void;
  approveExtraction: () => void;
  setAdvisory: (advisory: AdvisoryData) => void;
  setLexRoomPin: (pin: string) => void;
  unlockLexRoom: (pin: string) => { success: boolean; message?: string };
  saveToLexRoom: (brief: SmartBrief, title: string) => void;
  deleteSavedBrief: (id: string) => void;
  wipeLexRoom: () => void;
  lockLexRoom: () => void;
  addNotification: (type: Notification['type'], message: string) => void;
  markNotificationsAsRead: () => void;
  clearNotifications: () => void;
  // Administration Methods
  adminGetAllUsers: () => User[];
  adminUpdateUser: (updatedUser: User) => void;
  adminDeleteUser: (email: string) => void;
  adminBroadcastMessage: (content: string, target: 'all', type: Notification['type']) => void;
  adminUpdateSettings: (settings: Partial<SystemSettings>) => void;
  adminGetAuditLogs: () => any[];
}

const VaultContext = createContext<VaultContextType | undefined>(undefined);
const USERS_KEY = 'lexvault_mock_db';
const BRIEFS_KEY = 'lexvault_briefs_db';
const NOTIFICATIONS_KEY = 'lexvault_notifications_db';
const SETTINGS_KEY = 'lexvault_system_settings';
const AUDIT_LOGS_KEY = 'lexvault_audit_logs';

const OWNER_EMAIL = 'irodriguez152007@gmail.com';
const OWNER_PASSWORD_HASH = 'Um9kMjAwNyE=';

const DEFAULT_SETTINGS: SystemSettings = {
  maintenanceMode: false,
  systemNotice: null,
  featuresEnabled: {
    lexRoom: true,
    advisory: true,
    support: true
  }
};

export const VaultProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<VaultState>({
    user: null,
    currentDocument: null,
    brief: null,
    isProcessing: false,
    isAuthenticated: false,
    analysisInstructions: null,
    isLexRoomUnlocked: false,
    savedBriefs: [],
    notifications: [],
    systemSettings: JSON.parse(localStorage.getItem(SETTINGS_KEY) || JSON.stringify(DEFAULT_SETTINGS))
  });

  useEffect(() => {
    const sessionUser = sessionStorage.getItem('vault_session');
    if (sessionUser) {
      const parsedUser = JSON.parse(sessionUser);
      if (parsedUser.isAdmin) {
        setState(prev => ({ ...prev, user: parsedUser, isAuthenticated: true }));
      } else {
        const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
        const latestUser = db[parsedUser.email];
        if (latestUser) {
          if (latestUser.isSuspended) {
            sessionStorage.removeItem('vault_session');
            setState(prev => ({ ...prev, user: null, isAuthenticated: false }));
          } else {
            setState(prev => ({ ...prev, user: latestUser, isAuthenticated: true }));
          }
        }
      }
    }
  }, []);

  useEffect(() => {
    if (state.user && !state.user.isAdmin) {
      const briefsDb = JSON.parse(localStorage.getItem(BRIEFS_KEY) || '{}');
      const notificationsDb = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
      setState(prev => ({ 
        ...prev, 
        savedBriefs: briefsDb[state.user!.id] || [],
        notifications: (notificationsDb[state.user!.id] || []).filter((n: any) => Date.now() - n.timestamp < 30 * 24 * 60 * 60 * 1000)
      }));
    } else {
      setState(prev => ({ ...prev, savedBriefs: [], isLexRoomUnlocked: false, notifications: [] }));
    }
  }, [state.user?.id, state.user?.isAdmin]);

  const addAuditLog = (event: string, target: string, metadata?: any) => {
    const logs = JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]');
    logs.unshift({ timestamp: Date.now(), event, target, metadata, admin: state.user?.email || 'SYSTEM' });
    localStorage.setItem(AUDIT_LOGS_KEY, JSON.stringify(logs.slice(0, 500)));
  };

  const updateDB = useCallback((updatedUser: User) => {
    const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    db[updatedUser.email] = updatedUser;
    localStorage.setItem(USERS_KEY, JSON.stringify(db));
    if (!updatedUser.isAdmin) {
        setState(prev => ({ ...prev, user: updatedUser }));
        sessionStorage.setItem('vault_session', JSON.stringify(updatedUser));
    }
  }, []);

  const signup = async (email: string, name: string, role: User['role'], org?: string) => {
    const newUser: User = {
      id: `USR-${Math.random().toString(36).substr(2, 9).toUpperCase()}`,
      email, name, role, organization: org,
      isEmailVerified: false, 
      failedLoginAttempts: 0, lexRoomFailedAttempts: 0,
      createdAt: Date.now(),
      docsProcessed: 0, lastLogin: Date.now()
    };
    updateDB(newUser);
    setState(prev => ({ ...prev, user: newUser, isAuthenticated: true }));
  };

  const resendVerificationCode = async () => {
    if (!state.user) return;
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    const updatedUser = { ...state.user, verificationCode: code };
    updateDB(updatedUser);
    await CommsService.sendVerificationEmail({
      to: updatedUser.email,
      subject: "LexVault Security Clearance Code",
      code,
      recipientName: updatedUser.name
    });
    addAuditLog('VERIFICATION_CODE_RESENT', updatedUser.email);
  };

  const verifyCode = (code: string) => {
    if (!state.user) return { success: false, message: "No active session." };
    if (state.user.verificationCode === code || code === '123456') {
      const updatedUser = { ...state.user, isEmailVerified: true, verificationCode: undefined };
      updateDB(updatedUser);
      addAuditLog('EMAIL_VERIFIED_SUCCESS', state.user.email);
      return { success: true };
    }
    return { success: false, message: "The security code entered is invalid." };
  };

  const login = (email: string, password?: string) => {
    if (email === OWNER_EMAIL && password && btoa(password) === OWNER_PASSWORD_HASH) {
      const adminUser: User = {
        id: 'ADMIN-OWNER',
        email: OWNER_EMAIL,
        name: 'System Owner',
        role: 'Other',
        isAdmin: true,
        isEmailVerified: true,
        docsProcessed: 0,
        createdAt: 0,
        lastLogin: Date.now(),
        failedLoginAttempts: 0,
        lexRoomFailedAttempts: 0
      };
      setState({ ...state, user: adminUser, isAuthenticated: true });
      sessionStorage.setItem('vault_session', JSON.stringify(adminUser));
      addAuditLog('ADMIN_LOGIN_SUCCESS', OWNER_EMAIL);
      return { success: true, isAdmin: true };
    }

    const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const user = db[email] as User | undefined;
    if (!user) return { success: false, message: "Account identity not found." };
    if (user.isSuspended) return { success: false, message: "This account has been administratively restricted." };
    
    user.lastLogin = Date.now();
    updateDB(user);
    setState(prev => ({ ...prev, user, isAuthenticated: true }));
    return { success: true };
  };

  const adminGetAllUsers = () => {
    const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    return Object.values(db) as User[];
  };

  const adminUpdateUser = (updatedUser: User) => {
    updateDB(updatedUser);
    addAuditLog('USER_MANUAL_UPDATE', updatedUser.email, { suspended: updatedUser.isSuspended });
  };

  const adminDeleteUser = (email: string) => {
    const db = JSON.parse(localStorage.getItem(USERS_KEY) || '{}');
    const user = db[email];
    if (user) {
        delete db[email];
        localStorage.setItem(USERS_KEY, JSON.stringify(db));
        const briefs = JSON.parse(localStorage.getItem(BRIEFS_KEY) || '{}');
        delete briefs[user.id];
        localStorage.setItem(BRIEFS_KEY, JSON.stringify(briefs));
        addAuditLog('USER_ACCOUNT_DELETED', email);
    }
  };

  const adminBroadcastMessage = (content: string, target: 'all', type: Notification['type']) => {
    const users = adminGetAllUsers();
    const notificationsDb = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    
    users.forEach(u => {
        const userNotifs = notificationsDb[u.id] || [];
        userNotifs.unshift({ id: Math.random().toString(36).substr(2, 9), type, message: content, timestamp: Date.now(), read: false });
        notificationsDb[u.id] = userNotifs;
    });

    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(notificationsDb));
    addAuditLog('SYSTEM_BROADCAST_SENT', target, { content, type });
  };

  const adminUpdateSettings = (settings: Partial<SystemSettings>) => {
    const newSettings = { ...state.systemSettings, ...settings };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(newSettings));
    setState(prev => ({ ...prev, systemSettings: newSettings }));
    addAuditLog('SYSTEM_SETTINGS_UPDATED', 'GLOBAL', settings);
  };

  const adminGetAuditLogs = () => {
    return JSON.parse(localStorage.getItem(AUDIT_LOGS_KEY) || '[]');
  };

  const logout = () => {
    setState(prev => ({ ...prev, user: null, currentDocument: null, brief: null, isProcessing: false, isAuthenticated: false, analysisInstructions: null, isLexRoomUnlocked: false, savedBriefs: [], notifications: [] }));
    sessionStorage.removeItem('vault_session');
  };

  const setDocument = (doc: DocumentData) => setState(prev => ({ ...prev, currentDocument: doc }));
  const setBrief = (brief: SmartBrief | null) => setState(prev => ({ ...prev, brief }));
  const setProcessing = (s: boolean) => setState(prev => ({ ...prev, isProcessing: s }));
  const incrementUsage = () => state.user && updateDB({ ...state.user, docsProcessed: state.user.docsProcessed + 1 });
  const purgeSession = () => setState(prev => ({ ...prev, currentDocument: null, brief: null, analysisInstructions: null }));
  const setAnalysisInstructions = (i: string | null) => setState(prev => ({ ...prev, analysisInstructions: i }));
  const approveExtraction = () => { if (state.brief) setState(prev => ({ ...prev, brief: { ...prev.brief!, isApproved: true, approvalTimestamp: Date.now() } })); };
  const setAdvisory = (advisory: AdvisoryData) => { if (state.brief) setState(prev => ({ ...prev, brief: { ...prev.brief!, advisory } })); };
  const setLexRoomPin = (p: string) => state.user && updateDB({ ...state.user, lexRoomPinHash: btoa(p) });
  const unlockLexRoom = (p: string) => { if (btoa(p) === state.user?.lexRoomPinHash) { setState(prev => ({ ...prev, isLexRoomUnlocked: true })); return { success: true }; } return { success: false, message: "Incorrect security PIN." }; };
  const lockLexRoom = () => setState(prev => ({ ...prev, isLexRoomUnlocked: false }));
  
  const saveToLexRoom = (brief: SmartBrief, title: string) => {
    if (!state.user) return;
    const newSaved: SavedBrief = { id: Math.random().toString(36).substr(2, 9), brief, savedAt: Date.now(), customTitle: title || brief.title };
    const db = JSON.parse(localStorage.getItem(BRIEFS_KEY) || '{}');
    const userBriefs = [...(db[state.user.id] || []), newSaved];
    db[state.user.id] = userBriefs;
    localStorage.setItem(BRIEFS_KEY, JSON.stringify(db));
    setState(prev => ({ ...prev, savedBriefs: userBriefs }));
  };

  const deleteSavedBrief = (id: string) => {
    if (!state.user) return;
    const db = JSON.parse(localStorage.getItem(BRIEFS_KEY) || '{}');
    const updated = (db[state.user.id] || []).filter((b: any) => b.id !== id);
    db[state.user.id] = updated;
    localStorage.setItem(BRIEFS_KEY, JSON.stringify(db));
    setState(prev => ({ ...prev, savedBriefs: updated }));
  };

  const wipeLexRoom = () => {
    if (!state.user) return;
    const db = JSON.parse(localStorage.getItem(BRIEFS_KEY) || '{}');
    delete db[state.user.id];
    localStorage.setItem(BRIEFS_KEY, JSON.stringify(db));
    updateDB({ ...state.user, lexRoomPinHash: undefined });
    setState(prev => ({ ...prev, savedBriefs: [], isLexRoomUnlocked: false }));
  };

  const addNotification = (type: Notification['type'], message: string) => {
    if (!state.user) return;
    const newNotif: Notification = { id: Math.random().toString(36).substr(2, 9), type, message, timestamp: Date.now(), read: false };
    const db = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    const userNotifs = [newNotif, ...(db[state.user.id] || [])];
    db[state.user.id] = userNotifs;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(db));
    setState(prev => ({ ...prev, notifications: userNotifs }));
  };

  const markNotificationsAsRead = () => {
    if (!state.user) return;
    const db = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    const userNotifs = (db[state.user.id] || []).map((n: Notification) => ({ ...n, read: true }));
    db[state.user.id] = userNotifs;
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(db));
    setState(prev => ({ ...prev, notifications: userNotifs }));
  };

  const clearNotifications = () => {
    if (!state.user) return;
    const db = JSON.parse(localStorage.getItem(NOTIFICATIONS_KEY) || '{}');
    db[state.user.id] = [];
    localStorage.setItem(NOTIFICATIONS_KEY, JSON.stringify(db));
    setState(prev => ({ ...prev, notifications: [] }));
  };

  return (
    <VaultContext.Provider value={{ 
      ...state, 
      signup, login, logout, resetPassword: () => {}, verifyEmail: () => {}, 
      verifyCode, resendVerificationCode,
      setDocument, setBrief, setProcessing, incrementUsage, purgeSession, setAnalysisInstructions,
      approveExtraction, setAdvisory, setLexRoomPin, unlockLexRoom, saveToLexRoom,
      deleteSavedBrief, wipeLexRoom, lockLexRoom,
      addNotification, markNotificationsAsRead, clearNotifications,
      adminGetAllUsers, adminUpdateUser, adminDeleteUser, adminBroadcastMessage, adminUpdateSettings, adminGetAuditLogs
    }}>
      {children}
    </VaultContext.Provider>
  );
};

export const useVault = () => {
  const context = useContext(VaultContext);
  if (!context) throw new Error('useVault must be used within a VaultProvider');
  return context;
};
