import AsyncStorage from '@react-native-async-storage/async-storage';
import { RECIPES_STORAGE_KEY, Recipe } from '../store/recipeStore';
import { getBrewDatabase, isSQLiteAvailable } from '../database/brewDb';

interface ExportedBrewRecord {
  id: string;
  recipeId?: string | null;
  recipeName: string;
  status: string;
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
  quickNotes: any[];
  measurements: any[];
  createdAt?: string;
  updatedAt?: string;
}

interface ExportPayload {
  exportedAt: string;
  recipes: Recipe[];
  brews: ExportedBrewRecord[];
  meta: {
    version: string;
  };
}

const parseJSONColumn = <T>(value: string | null | undefined, fallback: T): T => {
  if (!value) return fallback;
  try {
    return JSON.parse(value) as T;
  } catch (error) {
    return fallback;
  }
};

const parseMaybeNumber = (value: any): number | null => {
  if (value === null || value === undefined) return null;
  const parsed = Number(value);
  return Number.isNaN(parsed) ? null : parsed;
};

export const exportUserData = async (): Promise<string> => {
  const [recipes, brews] = await Promise.all([loadRecipes(), loadBrews()]);

  const payload: ExportPayload = {
    exportedAt: new Date().toISOString(),
    recipes,
    brews,
    meta: {
      version: '1.0',
    },
  };

  return JSON.stringify(payload, null, 2);
};

export const importUserData = async (json: string) => {
  if (!json || typeof json !== 'string') {
    throw new Error('No se proporcionó un contenido válido para importar.');
  }

  let parsed: any;
  try {
    parsed = JSON.parse(json);
  } catch (error) {
    throw new Error('El archivo no tiene un formato JSON válido.');
  }

  const recipes: Recipe[] = Array.isArray(parsed?.recipes) ? parsed.recipes : [];
  const brews: ExportedBrewRecord[] = Array.isArray(parsed?.brews) ? parsed.brews : [];

  await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));

  let importedBrews = 0;
  const warnings: string[] = [];

  if (brews.length > 0) {
    if (!isSQLiteAvailable) {
      warnings.push('Los lotes no pudieron restaurarse porque SQLite no está disponible en esta plataforma.');
    } else {
      const db = await getBrewDatabase();
      if (!db) {
        warnings.push('No se pudo acceder a la base de datos de brews.');
      } else {
        await db.runAsync('DELETE FROM brews');
        for (const brew of brews) {
          try {
            await db.runAsync(
              `INSERT OR REPLACE INTO brews (
                id,
                recipe_id,
                recipe_name,
                brew_date,
                status,
                fermentation_start,
                conditioning_start,
                packaging_date,
                batch_size,
                original_gravity,
                final_gravity,
                measured_abv,
                fermentation_temp,
                target_fermentation_days,
                target_conditioning_days,
                fermentation_days,
                conditioning_days,
                notes,
                quick_notes,
                measurements,
                created_at,
                updated_at
              ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
              [
                brew.id,
                brew.recipeId ?? null,
                brew.recipeName ?? 'Untitled Brew',
                brew.brewDate ?? new Date().toISOString(),
                brew.status ?? 'brewing',
                brew.fermentationStart ?? null,
                brew.conditioningStart ?? null,
                brew.packagingDate ?? null,
                parseMaybeNumber(brew.batchSize),
                parseMaybeNumber(brew.originalGravity),
                parseMaybeNumber(brew.finalGravity),
                parseMaybeNumber(brew.measuredAbv),
                parseMaybeNumber(brew.fermentationTemp),
                brew.targetFermentationDays ?? 14,
                brew.targetConditioningDays ?? 14,
                brew.actualFermentationDays ?? null,
                brew.actualConditioningDays ?? null,
                brew.notes ?? null,
                JSON.stringify(brew.quickNotes ?? []),
                JSON.stringify(brew.measurements ?? []),
                brew.createdAt ?? new Date().toISOString(),
                brew.updatedAt ?? new Date().toISOString(),
              ]
            );
            importedBrews += 1;
          } catch (error) {
            warnings.push(`No se pudo importar el brew con ID ${brew.id}.`);
          }
        }
      }
    }
  }

  return {
    recipes: recipes.length,
    brews: importedBrews,
    warnings,
  };
};

const loadRecipes = async (): Promise<Recipe[]> => {
  try {
    const stored = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
    return stored ? (JSON.parse(stored) as Recipe[]) : [];
  } catch (error) {
    return [];
  }
};

const loadBrews = async (): Promise<ExportedBrewRecord[]> => {
  if (!isSQLiteAvailable) return [];

  const db = await getBrewDatabase();
  if (!db) return [];

  try {
    const rows = await db.getAllAsync<any>('SELECT * FROM brews ORDER BY datetime(brew_date) DESC');
    return rows.map((row: any) => ({
      id: row.id,
      recipeId: row.recipe_id,
      recipeName: row.recipe_name,
      status: row.status,
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
      quickNotes: parseJSONColumn(row.quick_notes, []),
      measurements: parseJSONColumn(row.measurements, []),
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    }));
  } catch (error) {
    return [];
  }
};
