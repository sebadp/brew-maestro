import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Recipe } from './recipeStore';
import { formatDateTime } from '../utils/date';

export interface BrewStep {
  id: string;
  name: string;
  duration: number; // in minutes
  temperature?: number; // in Celsius
  description?: string;
  completed: boolean;
  completedAt?: string;
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

  // Actions
  loadSessions: () => Promise<void>;
  startSession: (recipe: Recipe) => Promise<void>;
  updateSession: (sessionId: string, updates: Partial<BrewSession>) => Promise<void>;
  completeStep: (sessionId: string, stepId: string) => Promise<void>;
  addMeasurement: (sessionId: string, measurement: Omit<Measurement, 'id' | 'timestamp'>) => Promise<void>;
  addNote: (sessionId: string, note: string) => Promise<void>;
  setActiveSession: (sessionId: string | null) => void;
  getSession: (id: string) => BrewSession | undefined;
  clearError: () => void;
}

const STORAGE_KEY = '@brewmaestro:brewSessions';

// Default brew steps template
const createDefaultSteps = (recipe: Recipe): BrewStep[] => [
  {
    id: '1',
    name: 'Prepare Equipment',
    duration: 15,
    description: 'Sanitize all equipment and gather ingredients',
    completed: false,
  },
  {
    id: '2',
    name: 'Heat Water',
    duration: 30,
    temperature: 72,
    description: 'Heat strike water to mash temperature',
    completed: false,
  },
  {
    id: '3',
    name: 'Mash In',
    duration: 60,
    temperature: 66,
    description: 'Add grains and maintain mash temperature',
    completed: false,
  },
  {
    id: '4',
    name: 'Mash Out',
    duration: 10,
    temperature: 75,
    description: 'Raise temperature to mash out',
    completed: false,
  },
  {
    id: '5',
    name: 'Sparge',
    duration: 30,
    temperature: 75,
    description: 'Rinse grains to extract remaining sugars',
    completed: false,
  },
  {
    id: '6',
    name: 'Boil - Bittering Hops',
    duration: recipe.boilTime - 15,
    description: 'Add bittering hops and start boil timer',
    completed: false,
  },
  {
    id: '7',
    name: 'Boil - Flavor Hops',
    duration: 10,
    description: 'Add flavor hops',
    completed: false,
  },
  {
    id: '8',
    name: 'Boil - Aroma Hops',
    duration: 5,
    description: 'Add aroma hops and finish boil',
    completed: false,
  },
  {
    id: '9',
    name: 'Cool Down',
    duration: 20,
    temperature: 20,
    description: 'Cool wort to pitching temperature',
    completed: false,
  },
  {
    id: '10',
    name: 'Transfer & Pitch',
    duration: 15,
    description: 'Transfer to fermenter and pitch yeast',
    completed: false,
  },
];

const useBrewSessionStore = create<BrewSessionStore>((set, get) => ({
  sessions: [],
  activeSession: null,
  isLoading: false,
  error: null,

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
      const session: BrewSession = {
        id: Date.now().toString(),
        recipeId: recipe.id,
        recipeName: recipe.name,
        status: 'brewing',
        startedAt: new Date().toISOString(),
        currentStepIndex: 0,
        steps: createDefaultSteps(recipe),
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
}));

export default useBrewSessionStore;
