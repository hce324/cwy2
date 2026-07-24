import { create } from 'zustand';
import { Role, ViewId } from './types';
import { canAccess, getDefaultView } from './navigation';

interface AppState {
  // Core state
  currentRole: Role;
  currentView: ViewId;
  isPresentationMode: boolean;
  sidebarCollapsed: boolean;
  aiPanelOpen: boolean;
  aiPanelTab: 'diagnosis' | 'chat';
  aiModule: 'finance' | 'hr';
  aiUnreadCount: number;

  // HR roster UI state
  hrStaffSearch: string;
  hrStaffDeptFilter: string;
  hrStaffPage: number;

  // Actions
  setRole: (role: Role) => void;
  setHrStaffSearch: (v: string) => void;
  setHrStaffDeptFilter: (v: string) => void;
  setHrStaffPage: (v: number) => void;
  setView: (view: ViewId) => void;
  togglePresentationMode: () => void;
  setPresentationMode: (on: boolean) => void;
  toggleSidebar: () => void;
  setAiPanelOpen: (open: boolean) => void;
  setAiPanelTab: (tab: 'diagnosis' | 'chat') => void;
  setAiModule: (m: 'finance' | 'hr') => void;

  // Chat history（按模块分桶：财务 / 人事）
  chatHistory: Record<'finance' | 'hr', ChatMessage[]>;
  addChatMessage: (module: 'finance' | 'hr', msg: ChatMessage) => void;
  clearChatHistory: (module: 'finance' | 'hr') => void;

  // Month-end task completion
  closingTasks: Record<string, boolean>;
  toggleClosingTask: (id: string) => void;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'ai';
  content: string;
  timestamp: number;
}

export const useAppStore = create<AppState>((set, get) => ({
  currentRole: '财务负责人',
  currentView: 'workbench',
  isPresentationMode: false,
  sidebarCollapsed: false,
  aiPanelOpen: false,
  aiPanelTab: 'diagnosis',
  aiModule: 'finance',
  aiUnreadCount: 6,

  // HR roster UI state
  hrStaffSearch: '',
  hrStaffDeptFilter: '全部部门',
  hrStaffPage: 1,

  setRole: (role: Role) => {
    const state = get();
    const defaultView = getDefaultView(role);
    set({
      currentRole: role,
      currentView: defaultView,
      isPresentationMode: false,
      // HR 角色默认进入人事 AI 模块，财务角色默认进入财务模块
      aiModule: role.startsWith('HR') ? 'hr' : 'finance',
      // reset HR roster UI when switching roles
      hrStaffSearch: '',
      hrStaffDeptFilter: '全部部门',
      hrStaffPage: 1,
    });
  },

  setHrStaffSearch: (v: string) => set({ hrStaffSearch: v, hrStaffPage: 1 }),
  setHrStaffDeptFilter: (v: string) => set({ hrStaffDeptFilter: v, hrStaffPage: 1 }),
  setHrStaffPage: (v: number) => set({ hrStaffPage: v }),

  setView: (view: ViewId) => {
    const state = get();
    if (canAccess(view, state.currentRole, state.isPresentationMode)) {
      set({ currentView: view });
      // Update URL
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('view', view);
        window.history.pushState({}, '', url.toString());
      }
    }
  },

  togglePresentationMode: () => {
    const state = get();
    const newMode = !state.isPresentationMode;
    set({
      isPresentationMode: newMode,
      currentView: newMode ? 'blueprint' : getDefaultView(state.currentRole),
    });
  },

  setPresentationMode: (on: boolean) => {
    set({ isPresentationMode: on });
  },

  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),

  setAiPanelOpen: (open: boolean) => set({ aiPanelOpen: open }),

  setAiPanelTab: (tab: 'diagnosis' | 'chat') => set({ aiPanelTab: tab }),

  setAiModule: (m: 'finance' | 'hr') => set({ aiModule: m }),

  chatHistory: { finance: [], hr: [] },
  addChatMessage: (module, msg) => set(s => ({
    chatHistory: { ...s.chatHistory, [module]: [...s.chatHistory[module], msg] },
  })),
  clearChatHistory: (module) => set(s => ({
    chatHistory: { ...s.chatHistory, [module]: [] },
  })),

  closingTasks: {},
  toggleClosingTask: (id: string) => set(s => ({
    closingTasks: { ...s.closingTasks, [id]: !s.closingTasks[id] },
  })),
}));
