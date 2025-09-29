import { create } from 'zustand';
import { getBrewDatabase, isSQLiteAvailable } from '../database/brewDb';
import { scheduleBrewNotification } from '../utils/notifications';

export type BrewStatus = 'brewing' | 'fermenting' | 'conditioning' | 'completed' | 'archived';

export type MeasurementType = 'gravity' | 'temperature' | 'ph' | 'taste';

export interface Measurement {
  id: string;
  timestamp: string;
  type: MeasurementType;
  value: number | string;
  unit?: string;
  note?: string;
}

export interface QuickNote {
  id: string;
  timestamp: string;
  text: string;
}

export interface BrewRecord {
  id: string;
  recipeId?: string | null;
  recipeName: string;
  status: BrewStatus;
  brewDate: string;
  fermentationStart?: string | null;
  conditioningStart?: string | null;
  packagingDate?: string | null;
  batchSize?: number | null;
  originalGravity?: number | null;
  finalGravity?: number | null;
  measuredAbv?: number | null;
  fermentationTemp?: number | null;
  targetFermentationDays: number;
  targetConditioningDays: number;
  actualFermentationDays?: number | null;
  actualConditioningDays?: number | null;
  notes?: string | null;
  quickNotes: QuickNote[];
  measurements: Measurement[];
  createdAt?: string;
  updatedAt?: string;
}

interface StartBrewOptions {
  recipeId?: string;
  recipeName: string;
  batchSize?: number;
  targetFermentationDays?: number;
  targetConditioningDays?: number;
  fermentationTemp?: number;
  notes?: string;
}

interface BrewTrackerState {
  activeBrews: BrewRecord[];
  archivedBrews: BrewRecord[];
  isLoading: boolean;
  error: string | null;
  loadBrews: () => Promise<void>;
  startNewBrew: (options: StartBrewOptions) => Promise<BrewRecord>;
  startFermentation: (brewId: string, og: number, temperature?: number, targetDays?: number) => Promise<void>;
  startConditioning: (brewId: string, fg: number, targetDays?: number) => Promise<void>;
  completeBrew: (brewId: string) => Promise<void>;
  updateStatus: (brewId: string, status: BrewStatus) => Promise<void>;
  addMeasurement: (brewId: string, measurement: Omit<Measurement, 'id' | 'timestamp'>) => Promise<void>;
  addQuickNote: (brewId: string, note: string) => Promise<void>;
  deleteBrew: (brewId: string) => Promise<void>;
  getFermentationDay: (brew: BrewRecord) => number;
  getEstimatedCompletionDate: (brew: BrewRecord) => Date | null;
  getBrewProgress: (brew: BrewRecord) => number;
}

const ACTIVE_STATUSES: BrewStatus[] = ['brewing', 'fermenting', 'conditioning'];

const parseMaybeNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

const parseJSONColumn = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
};

const serializeJSONColumn = (value: unknown): string => JSON.stringify(value ?? null);

const mapRowToBrew = (row: any): BrewRecord => {
  return {
    id: row.id,
    recipeId: row.recipe_id,
    recipeName: row.recipe_name,
    status: row.status as BrewStatus,
    brewDate: row.brew_date,
    fermentationStart: row.fermentation_start,
    conditioningStart: row.conditioning_start,
    packagingDate: row.packaging_date,
    batchSize: parseMaybeNumber(row.batch_size),
    originalGravity: parseMaybeNumber(row.original_gravity),
    finalGravity: parseMaybeNumber(row.final_gravity),
    measuredAbv: parseMaybeNumber(row.measured_abv),
    fermentationTemp: parseMaybeNumber(row.fermentation_temp),
    targetFermentationDays: row.target_fermentation_days ?? 14,
    targetConditioningDays: row.target_conditioning_days ?? 14,
    actualFermentationDays: parseMaybeNumber(row.fermentation_days),
    actualConditioningDays: parseMaybeNumber(row.conditioning_days),
    notes: row.notes,
    quickNotes: parseJSONColumn<QuickNote[]>(row.quick_notes, []),
    measurements: parseJSONColumn<Measurement[]>(row.measurements, []),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const daysBetween = (startIso?: string | null, endIso?: string | null): number => {
  if (!startIso) return 0;
  const start = new Date(startIso);
  if (Number.isNaN(start.getTime())) return 0;
  const end = endIso ? new Date(endIso) : new Date();
  if (Number.isNaN(end.getTime())) return 0;
  return Math.max(0, Math.floor((end.getTime() - start.getTime()) / MS_IN_DAY));
};

const addDaysToDate = (startIso: string, days: number): Date => {
  const date = new Date(startIso);
  if (Number.isNaN(date.getTime())) {
    return new Date();
  }
  const result = new Date(date.getTime());
  result.setDate(result.getDate() + days);
  return result;
};

const ensureDatabase = async () => {
  if (!isSQLiteAvailable) {
    throw new Error('Fermentation tracking is only available on native builds.');
  }
  const db = await getBrewDatabase();
  if (!db) {
    throw new Error('SQLite database unavailable on this platform.');
  }
  return db;
};

export const useBrewTrackerStore = create<BrewTrackerState>((set, get) => ({
  activeBrews: [],
  archivedBrews: [],
  isLoading: false,
  error: null,

  loadBrews: async () => {
    set({ isLoading: true, error: null });
    try {
      if (!isSQLiteAvailable) {
        set({
          activeBrews: [],
          archivedBrews: [],
          isLoading: false,
          error: null,
        });
        return;
      }

      const db = await ensureDatabase();
      const rows = await db.getAllAsync<any>('SELECT * FROM brews ORDER BY datetime(brew_date) DESC');
      const mapped = rows.map(mapRowToBrew);
      set({
        activeBrews: mapped.filter(brew => ACTIVE_STATUSES.includes(brew.status)),
        archivedBrews: mapped.filter(brew => !ACTIVE_STATUSES.includes(brew.status)),
        isLoading: false,
      });
    } catch (error) {
      set({ error: 'Failed to load brews', isLoading: false });
    }
  },

  startNewBrew: async ({
    recipeId,
    recipeName,
    batchSize,
    targetFermentationDays = 14,
    targetConditioningDays = 14,
    fermentationTemp,
    notes,
  }) => {
    const id = `brew_${Date.now()}`;
    const nowIso = new Date().toISOString();

    const record: BrewRecord = {
      id,
      recipeId: recipeId ?? null,
      recipeName,
      status: 'brewing',
      brewDate: nowIso,
      batchSize: batchSize ?? null,
      fermentationTemp: fermentationTemp ?? null,
      targetFermentationDays,
      targetConditioningDays,
      actualFermentationDays: null,
      actualConditioningDays: null,
      notes: notes ?? null,
      quickNotes: [],
      measurements: [],
    };

    try {
      const db = await ensureDatabase();
      await db.runAsync(
        `INSERT INTO brews (
          id, recipe_id, recipe_name, brew_date, status, batch_size, fermentation_temp,
          target_fermentation_days, target_conditioning_days, fermentation_days, conditioning_days,
          notes, quick_notes, measurements
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)` ,
        [
          record.id,
          record.recipeId ?? null,
          record.recipeName,
          record.brewDate,
          record.status,
          record.batchSize ?? null,
          record.fermentationTemp ?? null,
          record.targetFermentationDays,
          record.targetConditioningDays,
          null,
          null,
          record.notes ?? null,
          serializeJSONColumn(record.quickNotes),
          serializeJSONColumn(record.measurements),
        ]
      );

      set(state => ({
        activeBrews: [record, ...state.activeBrews],
      }));

      return record;
    } catch (error) {
      set({ error: 'Failed to start brew' });
      throw error;
    }
  },

  startFermentation: async (brewId, og, temperature, targetDays) => {
    const nowIso = new Date().toISOString();
    try {
      const db = await ensureDatabase();
      const current = get().activeBrews.find(b => b.id === brewId);
      const targetFermentationDays = targetDays ?? current?.targetFermentationDays ?? 14;
      const fermentationEndDate = addDaysToDate(nowIso, targetFermentationDays);

      await db.runAsync(
        `UPDATE brews SET
          status = ?,
          fermentation_start = ?,
          original_gravity = ?,
          fermentation_temp = COALESCE(?, fermentation_temp),
          target_fermentation_days = ?,
          updated_at = ?
        WHERE id = ?`,
        ['fermenting', nowIso, og, temperature ?? null, targetFermentationDays, nowIso, brewId]
      );

      set(state => ({
        activeBrews: state.activeBrews.map(brew =>
          brew.id === brewId
            ? {
                ...brew,
                status: 'fermenting',
                fermentationStart: nowIso,
                originalGravity: og,
                fermentationTemp: temperature ?? brew.fermentationTemp,
                targetFermentationDays,
                actualFermentationDays: null,
              }
            : brew
        ),
      }));

      await scheduleBrewNotification(brewId, 'fermentation', fermentationEndDate);
    } catch (error) {
      set({ error: 'Failed to start fermentation' });
      throw error;
    }
  },

  startConditioning: async (brewId, fg, targetDays) => {
    const nowIso = new Date().toISOString();
    try {
      const db = await ensureDatabase();
      const brew = get().activeBrews.find(b => b.id === brewId);
      const measuredAbv = brew?.originalGravity
        ? Math.round(((brew.originalGravity - fg) * 131.25) * 10) / 10
        : null;
      const fermentationDays = brew?.fermentationStart ? daysBetween(brew.fermentationStart, nowIso) : null;
      const targetConditioningDays = targetDays ?? brew?.targetConditioningDays ?? 14;
      const conditioningEndDate = addDaysToDate(nowIso, targetConditioningDays);

      await db.runAsync(
        `UPDATE brews SET
          status = ?,
          conditioning_start = ?,
          final_gravity = ?,
          measured_abv = ?,
          fermentation_days = ?,
          target_conditioning_days = ?,
          updated_at = ?
        WHERE id = ?`,
        ['conditioning', nowIso, fg, measuredAbv, fermentationDays, targetConditioningDays, nowIso, brewId]
      );

      set(state => ({
        activeBrews: state.activeBrews.map(brewRecord =>
          brewRecord.id === brewId
            ? {
                ...brewRecord,
                status: 'conditioning',
                conditioningStart: nowIso,
                finalGravity: fg,
                measuredAbv,
                actualFermentationDays: fermentationDays,
                targetConditioningDays,
              }
            : brewRecord
        ),
      }));

      await scheduleBrewNotification(brewId, 'conditioning', conditioningEndDate);
    } catch (error) {
      set({ error: 'Failed to start conditioning' });
      throw error;
    }
  },

  completeBrew: async (brewId) => {
    const nowIso = new Date().toISOString();
    try {
      const db = await ensureDatabase();
      const brew = get().activeBrews.find(b => b.id === brewId);
      const conditioningDays = brew?.conditioningStart ? daysBetween(brew.conditioningStart, nowIso) : null;
      await db.runAsync(
        `UPDATE brews SET
          status = ?,
          packaging_date = ?,
          conditioning_days = ?,
          updated_at = ?
        WHERE id = ?`,
        ['completed', nowIso, conditioningDays, nowIso, brewId]
      );

      set(state => {
        const updated = state.activeBrews.find(b => b.id === brewId);
        const remainingActive = state.activeBrews.filter(b => b.id !== brewId);
        const completedRecord = updated
          ? {
              ...updated,
              status: 'completed' as const,
              packagingDate: nowIso,
              actualConditioningDays: conditioningDays,
            }
          : null;

        return {
          activeBrews: remainingActive,
          archivedBrews: completedRecord ? [completedRecord, ...state.archivedBrews] : state.archivedBrews,
        };
      });
    } catch (error) {
      set({ error: 'Failed to complete brew' });
      throw error;
    }
  },

  updateStatus: async (brewId, status) => {
    try {
      const db = await ensureDatabase();
      await db.runAsync(
        `UPDATE brews SET status = ?, updated_at = ? WHERE id = ?`,
        [status, new Date().toISOString(), brewId]
      );

      await get().loadBrews();
    } catch (error) {
      set({ error: 'Failed to update brew status' });
      throw error;
    }
  },

  addMeasurement: async (brewId, measurement) => {
    const nowIso = new Date().toISOString();
    const record: Measurement = {
      id: `measurement_${Date.now()}`,
      timestamp: nowIso,
      ...measurement,
    };

    try {
      const db = await ensureDatabase();
      const brew = get().activeBrews.find(b => b.id === brewId) || get().archivedBrews.find(b => b.id === brewId);
      const updatedMeasurements = [...(brew?.measurements ?? []), record];

      await db.runAsync(
        `UPDATE brews SET measurements = ?, updated_at = ? WHERE id = ?`,
        [serializeJSONColumn(updatedMeasurements), nowIso, brewId]
      );

      await get().loadBrews();
    } catch (error) {
      set({ error: 'Failed to add measurement' });
      throw error;
    }
  },

  deleteBrew: async (brewId) => {
    try {
      const db = await ensureDatabase();
      await db.runAsync('DELETE FROM brews WHERE id = ?', [brewId]);

      set(state => ({
        activeBrews: state.activeBrews.filter(brew => brew.id !== brewId),
        archivedBrews: state.archivedBrews.filter(brew => brew.id !== brewId),
      }));
    } catch (error) {
      set({ error: 'Failed to delete brew' });
      throw error;
    }
  },

  addQuickNote: async (brewId, note) => {
    const nowIso = new Date().toISOString();
    const quickNote: QuickNote = {
      id: `note_${Date.now()}`,
      timestamp: nowIso,
      text: note,
    };

    try {
      const db = await ensureDatabase();
      const brew = get().activeBrews.find(b => b.id === brewId) || get().archivedBrews.find(b => b.id === brewId);
      const updatedNotes = [...(brew?.quickNotes ?? []), quickNote];

      await db.runAsync(
        `UPDATE brews SET quick_notes = ?, updated_at = ? WHERE id = ?`,
        [serializeJSONColumn(updatedNotes), nowIso, brewId]
      );

      await get().loadBrews();
    } catch (error) {
      set({ error: 'Failed to add note' });
      throw error;
    }
  },

  getFermentationDay: (brew) => {
    if (brew.status === 'brewing') return 0;
    const start = brew.fermentationStart ?? brew.brewDate;
    return daysBetween(start, null);
  },

  getEstimatedCompletionDate: (brew) => {
    const start = brew.fermentationStart ?? brew.brewDate;
    if (!start) return null;
    return addDaysToDate(start, brew.targetFermentationDays + brew.targetConditioningDays);
  },

  getBrewProgress: (brew) => {
    if (brew.status === 'completed') return 100;
    if (brew.status === 'archived') return 100;

    const fermentationTarget = brew.targetFermentationDays || 1;
    const conditioningTarget = brew.targetConditioningDays || 1;

    if (brew.status === 'brewing') {
      return 5;
    }

    if (brew.status === 'fermenting') {
      const fermentationDays = daysBetween(brew.fermentationStart ?? brew.brewDate, null);
      return Math.min(50, (fermentationDays / fermentationTarget) * 50) + 5;
    }

    if (brew.status === 'conditioning') {
      const fermentationContribution = 55; // 5% buffer + 50% fermentation
      const conditioningDays = daysBetween(brew.conditioningStart, null);
      return Math.min(100, fermentationContribution + (conditioningDays / conditioningTarget) * 45);
    }

    return 0;
  },
}));
