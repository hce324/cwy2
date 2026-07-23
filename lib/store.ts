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
  aiUnreadCount: number;

  // Actions
  setRole: (role: Role) => void;
  setView: (view: ViewId) => void;
  togglePresentationMode: () => void;
  setPresentationMode: (on: boolean) => void;
  toggleSidebar: () => void;
  setAiPanelOpen: (open: boolean) => void;
  setAiPanelTab: (tab: 'diagnosis' | 'chat') => void;

  // Chat history
  chatHistory: ChatMessage[];
  addChatMessage: (msg: ChatMessage) => void;
  clearChatHistory: () => void;

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
  aiUnreadCount: 6,

  setRole: (role: Role) => {
    const state = get();
    const defaultView = getDefaultView(role);
    set({
      currentRole: role,
      currentView: defaultView,
      isPresentationMode: false,
    });
  },

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

  chatHistory: [],
  addChatMessage: (msg: ChatMessage) => set(s => ({
    chatHistory: [...s.chatHistory, msg],
  })),
  clearChatHistory: () => set({ chatHistory: [] }),

  closingTasks: {},
  toggleClosingTask: (id: string) => set(s => ({
    closingTasks: { ...s.closingTasks, [id]: !s.closingTasks[id] },
  })),
}));
