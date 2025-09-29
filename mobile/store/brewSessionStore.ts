import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeStore';
import { formatDateTime } from '../utils/date';
import { scheduleStepNotification, cancelStepNotification, cancelAllStepNotifications } from '../utils/notifications';

export interface BrewStepTask {
  id: string;
  text: string;
  completed: boolean;
}

export interface BrewStep {
  id: string;
  name: string;
  duration: number; // in minutes
  temperature?: number; // in Celsius
  description?: string;
  completed: boolean;
  completedAt?: string;
  tasks?: BrewStepTask[];
}

export interface Measurement {
  id: string;
  type: 'og' | 'fg' | 'temperature' | 'ph' | 'volume' | 'gravity';
  value: number;
  unit: string;
  timestamp: string;
  notes?: string;
}

export interface BrewSession {
  id: string;
  recipeId: string;
  recipeName: string;
  status: 'planning' | 'brewing' | 'fermenting' | 'conditioning' | 'completed';
  startedAt: string;
  completedAt?: string;
  currentStepIndex: number;
  currentStepTargetTs?: number | null;
  currentStepNotificationId?: string | null;
  steps: BrewStep[];
  measurements: Measurement[];
  notes: string[];
  efficiency?: number;
  actualOG?: number;
  actualFG?: number;
  actualABV?: number;
}

interface BrewSessionStore {
  sessions: BrewSession[];
  activeSession: BrewSession | null;
  isLoading: boolean;
  error: string | null;
  stepTaskTemplates: Record<string, string[]>;
  templatesLoaded: boolean;

  // Actions
  loadSessions: () => Promise<void>;
  startSession: (recipe: Recipe) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<BrewSession>) => Promise<void>;
  completeStep: (sessionId: string, stepId: string) => Promise<void>;
  addMeasurement: (sessionId: string, measurement: Omit<Measurement, 'id' | 'timestamp'>) => Promise<void>;
  addNote: (sessionId: string, note: string) => Promise<void>;
  addStepTask: (sessionId: string, stepId: string, task: string) => Promise<void>;
  toggleStepTask: (sessionId: string, stepId: string, taskId: string) => Promise<void>;
  removeStepTask: (sessionId: string, stepId: string, taskId: string) => Promise<void>;
  loadStepTaskTemplates: () => Promise<void>;
  addTemplateTask: (stepId: string, task: string) => Promise<void>;
  removeTemplateTask: (stepId: string, task: string) => Promise<void>;
  deleteSession: (sessionId: string) => Promise<void>;
  setActiveSession: (sessionId: string | null) => void;
  getSession: (id: string) => BrewSession | undefined;
  clearError: () => void;
  // Timer actions
  startStepTimer: (sessionId: string, remainingSeconds: number) => Promise<void>;
  pauseStepTimer: (sessionId: string) => Promise<void>;
  resumeStepTimer: (sessionId: string, remainingSeconds: number) => Promise<void>;
  clearStepTimer: (sessionId: string) => Promise<void>;
  getRemainingTime: (sessionId: string) => number;
}

const STORAGE_KEY = '@brewmaestro:brewSessions';
const STEP_TASK_TEMPLATES_KEY = '@brewmaestro:stepTaskTemplates';

// Default brew steps template
const createDefaultSteps = (recipe: Recipe): BrewStep[] => [
  {
    id: '1',
    name: 'Prepare Equipment',
    duration: 15,
    description: 'Sanitize all equipment and gather ingredients',
    completed: false,
    tasks: [],
  },
  {
    id: '2',
    name: 'Heat Water',
    duration: 30,
    temperature: 72,
    description: 'Heat strike water to mash temperature',
    completed: false,
    tasks: [],
  },
  {
    id: '3',
    name: 'Mash In',
    duration: 60,
    temperature: 66,
    description: 'Add grains and maintain mash temperature',
    completed: false,
    tasks: [],
  },
  {
    id: '4',
    name: 'Mash Out',
    duration: 10,
    temperature: 75,
    description: 'Raise temperature to mash out',
    completed: false,
    tasks: [],
  },
  {
    id: '5',
    name: 'Sparge',
    duration: 30,
    temperature: 75,
    description: 'Rinse grains to extract remaining sugars',
    completed: false,
    tasks: [],
  },
  {
    id: '6',
    name: 'Boil - Bittering Hops',
    duration: recipe.boilTime - 15,
    description: 'Add bittering hops and start boil timer',
    completed: false,
    tasks: [],
  },
  {
    id: '7',
    name: 'Boil - Flavor Hops',
    duration: 10,
    description: 'Add flavor hops',
    completed: false,
    tasks: [],
  },
  {
    id: '8',
    name: 'Boil - Aroma Hops',
    duration: 5,
    description: 'Add aroma hops and finish boil',
    completed: false,
    tasks: [],
  },
  {
    id: '9',
    name: 'Cool Down',
    duration: 20,
    temperature: 20,
    description: 'Cool wort to pitching temperature',
    completed: false,
    tasks: [],
  },
  {
    id: '10',
    name: 'Transfer & Pitch',
    duration: 15,
    description: 'Transfer to fermenter and pitch yeast',
    completed: false,
    tasks: [],
  },
];

const useBrewSessionStore = create<BrewSessionStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,
  stepTaskTemplates: {},
  templatesLoaded: false,

  loadStepTaskTemplates: async () => {
    try {
      const stored = await AsyncStorage.getItem(STEP_TASK_TEMPLATES_KEY);
      const templates = stored ? JSON.parse(stored) : {};
      set({ stepTaskTemplates: templates, templatesLoaded: true });
    } catch (error) {
      set({ stepTaskTemplates: {}, templatesLoaded: true });
    }
  },

  addTemplateTask: async (stepId, taskText) => {
    const trimmed = taskText.trim();
    if (!trimmed) return;

    if (!get().templatesLoaded) {
      await get().loadStepTaskTemplates();
    }

    const currentTemplates = get().stepTaskTemplates;
    const existing = currentTemplates[stepId] ?? [];
    if (existing.includes(trimmed)) return;

    const updatedTemplates = {
      ...currentTemplates,
      [stepId]: [...existing, trimmed],
    };

    await AsyncStorage.setItem(STEP_TASK_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    set({ stepTaskTemplates: updatedTemplates });
  },

  removeTemplateTask: async (stepId, taskText) => {
    if (!get().templatesLoaded) {
      await get().loadStepTaskTemplates();
    }

    const currentTemplates = get().stepTaskTemplates;
    const existing = currentTemplates[stepId] ?? [];
    const updatedStepTasks = existing.filter(text => text !== taskText);
    const updatedTemplates = { ...currentTemplates, [stepId]: updatedStepTasks };

    await AsyncStorage.setItem(STEP_TASK_TEMPLATES_KEY, JSON.stringify(updatedTemplates));
    set({ stepTaskTemplates: updatedTemplates });
  },

  loadSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const sessions = stored ? JSON.parse(stored) : [];

      // Find any active session
      const activeSession = sessions.find((s: BrewSession) =>
        s.status === 'brewing' || s.status === 'fermenting'
      ) || null;

      set({ sessions, activeSession, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load brew sessions', isLoading: false });
    }
  },

  startSession: async (recipe) => {
    set({ isLoading: true, error: null });
    try {
      if (!get().templatesLoaded) {
        await get().loadStepTaskTemplates();
      }

      const templates = get().stepTaskTemplates;
      const defaultSteps = createDefaultSteps(recipe).map(step => {
        const templateTasks = templates[step.id] ?? [];
        return {
          ...step,
          tasks: templateTasks.map((text, index) => ({
            id: `template_${step.id}_${Date.now()}_${index}`,
            text,
            completed: false,
          })),
        };
      });

      const session: BrewSession = {
        id: Date.now().toString(),
        recipeId: recipe.id,
        recipeName: recipe.name,
        status: 'brewing',
        startedAt: new Date().toISOString(),
        currentStepIndex: 0,
        currentStepTargetTs: null,
        currentStepNotificationId: null,
        steps: defaultSteps,
        measurements: [],
        notes: [],
      };

      const currentSessions = get().sessions;
      const updatedSessions = [...currentSessions, session];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));
      set({
        sessions: updatedSessions,
        activeSession: session,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to start brew session', isLoading: false });
    }
  },

  updateSession: async (sessionId, updates) => {
    set({ isLoading: true, error: null });
    try {
      const currentSessions = get().sessions;
      const updatedSessions = currentSessions.map(session =>
        session.id === sessionId ? { ...session, ...updates } : session
      );

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));

      const updatedSession = updatedSessions.find(s => s.id === sessionId);
      const activeSession = get().activeSession;

      set({
        sessions: updatedSessions,
        activeSession: activeSession?.id === sessionId ? updatedSession : activeSession,
        isLoading: false
      });
    } catch (error) {
      set({ error: 'Failed to update session', isLoading: false });
    }
  },

  completeStep: async (sessionId, stepId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSteps = session.steps.map(step =>
      step.id === stepId
        ? { ...step, completed: true, completedAt: new Date().toISOString() }
        : step
    );

    const completedStepIndex = session.steps.findIndex(s => s.id === stepId);
    const nextStepIndex = Math.min(completedStepIndex + 1, session.steps.length - 1);

    await get().updateSession(sessionId, {
      steps: updatedSteps,
      currentStepIndex: nextStepIndex,
    });
  },

  addMeasurement: async (sessionId, measurementData) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const measurement: Measurement = {
      ...measurementData,
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
    };

    const updatedMeasurements = [...session.measurements, measurement];

    // Update session calculations based on measurement type
    let sessionUpdates: Partial<BrewSession> = { measurements: updatedMeasurements };

    if (measurement.type === 'og') {
      sessionUpdates.actualOG = measurement.value;
    } else if (measurement.type === 'fg') {
      sessionUpdates.actualFG = measurement.value;
      if (session.actualOG) {
        sessionUpdates.actualABV = Math.round(((session.actualOG - measurement.value) * 131.25) * 100) / 100;
      }
    }

    await get().updateSession(sessionId, sessionUpdates);
  },

  addNote: async (sessionId, note) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const timestamp = formatDateTime(new Date());
    const updatedNotes = [...session.notes, `${timestamp}: ${note}`];
    await get().updateSession(sessionId, { notes: updatedNotes });
  },

  addStepTask: async (sessionId, stepId, taskText) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const newTask: BrewStepTask = {
      id: `task_${Date.now()}`,
      text: taskText,
      completed: false,
    };

    const updatedSteps = session.steps.map(step =>
      step.id === stepId
        ? { ...step, tasks: [...(step.tasks ?? []), newTask] }
        : step
    );

    await get().updateSession(sessionId, { steps: updatedSteps });
    await get().addTemplateTask(stepId, taskText);
  },

  toggleStepTask: async (sessionId, stepId, taskId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const updatedSteps = session.steps.map(step => {
      if (step.id !== stepId) return step;
      const tasks = (step.tasks ?? []).map(task =>
        task.id === taskId ? { ...task, completed: !task.completed } : task
      );
      return { ...step, tasks };
    });

    await get().updateSession(sessionId, { steps: updatedSteps });
  },

  removeStepTask: async (sessionId, stepId, taskId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    let removedTask: BrewStepTask | undefined;
    const updatedSteps = session.steps.map(step => {
      if (step.id !== stepId) return step;
      const tasks = (step.tasks ?? []).filter(task => {
        if (task.id === taskId) {
          removedTask = task;
          return false;
        }
        return true;
      });
      return { ...step, tasks };
    });

    await get().updateSession(sessionId, { steps: updatedSteps });
    if (removedTask) {
      await get().removeTemplateTask(stepId, removedTask.text);
    }
  },

  deleteSession: async (sessionId) => {
    set({ isLoading: true, error: null });
    try {
      // Cancel all notifications for this session
      await cancelAllStepNotifications(sessionId);

      const currentSessions = get().sessions;
      const updatedSessions = currentSessions.filter(session => session.id !== sessionId);

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSessions));

      const activeSession = get().activeSession;
      set({
        sessions: updatedSessions,
        activeSession: activeSession?.id === sessionId ? null : activeSession,
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to delete session', isLoading: false });
    }
  },

  setActiveSession: (sessionId) => {
    const session = sessionId ? get().sessions.find(s => s.id === sessionId) : null;
    set({ activeSession: session || null });
  },

  getSession: (id) => {
    return get().sessions.find(session => session.id === id);
  },

  clearError: () => {
    set({ error: null });
  },

  // Timer actions
  startStepTimer: async (sessionId, remainingSeconds) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const targetTimestamp = Date.now() + (remainingSeconds * 1000);

    // Cancel any existing notification
    if (session.currentStepNotificationId) {
      await cancelStepNotification(session.currentStepNotificationId);
    }

    // Schedule new notification
    const currentStep = session.steps[session.currentStepIndex];
    const stepName = currentStep?.name || `Step ${session.currentStepIndex + 1}`;
    const notificationId = await scheduleStepNotification(
      sessionId,
      stepName,
      targetTimestamp
    );

    await get().updateSession(sessionId, {
      currentStepTargetTs: targetTimestamp,
      currentStepNotificationId: notificationId
    });
  },

  pauseStepTimer: async (sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session?.currentStepNotificationId) {
      await cancelStepNotification(session.currentStepNotificationId);
    }

    await get().updateSession(sessionId, {
      currentStepTargetTs: null,
      currentStepNotificationId: null
    });
  },

  resumeStepTimer: async (sessionId, remainingSeconds) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session) return;

    const targetTimestamp = Date.now() + (remainingSeconds * 1000);

    // Cancel any existing notification
    if (session.currentStepNotificationId) {
      await cancelStepNotification(session.currentStepNotificationId);
    }

    // Schedule new notification
    const currentStep = session.steps[session.currentStepIndex];
    const stepName = currentStep?.name || `Step ${session.currentStepIndex + 1}`;
    const notificationId = await scheduleStepNotification(
      sessionId,
      stepName,
      targetTimestamp
    );

    await get().updateSession(sessionId, {
      currentStepTargetTs: targetTimestamp,
      currentStepNotificationId: notificationId
    });
  },

  clearStepTimer: async (sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (session?.currentStepNotificationId) {
      await cancelStepNotification(session.currentStepNotificationId);
    }

    await get().updateSession(sessionId, {
      currentStepTargetTs: null,
      currentStepNotificationId: null
    });
  },

  getRemainingTime: (sessionId) => {
    const session = get().sessions.find(s => s.id === sessionId);
    if (!session || !session.currentStepTargetTs) {
      return 0;
    }

    const remaining = Math.max(0, Math.round((session.currentStepTargetTs - Date.now()) / 1000));

    // If the timer expired more than 1 hour ago, clear it (safety check)
    if (remaining === 0 && (Date.now() - session.currentStepTargetTs) > 3600000) {
      get().clearStepTimer(sessionId);
    }

    return remaining;
  },
}));

export default useBrewSessionStore;
