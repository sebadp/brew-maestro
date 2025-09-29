import { Platform } from 'react-native';

type SQLiteDatabase = import('expo-sqlite').SQLiteDatabase;
type SQLiteModule = typeof import('expo-sqlite');

const BREW_DB_NAME = 'brewmaestro.db';

const BREW_TABLE_SCHEMA = `
CREATE TABLE IF NOT EXISTS brews (
  id TEXT PRIMARY KEY NOT NULL,
  recipe_id TEXT,
  recipe_name TEXT NOT NULL,
  brew_date TEXT NOT NULL,
  status TEXT NOT NULL,
  fermentation_start TEXT,
  conditioning_start TEXT,
  packaging_date TEXT,
  batch_size REAL,
  original_gravity REAL,
  final_gravity REAL,
  measured_abv REAL,
  fermentation_temp REAL,
  target_fermentation_days INTEGER DEFAULT 14,
  target_conditioning_days INTEGER DEFAULT 14,
  fermentation_days INTEGER,
  conditioning_days INTEGER,
  notes TEXT,
  quick_notes TEXT,
  measurements TEXT,
  created_at TEXT DEFAULT (datetime('now')),
  updated_at TEXT DEFAULT (datetime('now'))
);
`;

export const isSQLiteAvailable = Platform.OS !== 'web';

let sqliteModulePromise: Promise<SQLiteModule> | null = null;
let databasePromise: Promise<SQLiteDatabase> | null = null;

const loadSQLiteModule = async (): Promise<SQLiteModule> => {
  if (!sqliteModulePromise) {
    sqliteModulePromise = Promise.resolve().then(() => require('expo-sqlite') as SQLiteModule);
  }
  return sqliteModulePromise;
};

export async function getBrewDatabase(): Promise<SQLiteDatabase | null> {
  if (!isSQLiteAvailable) {
    return null;
  }

  if (!databasePromise) {
    databasePromise = (async () => {
      const { openDatabaseAsync } = await loadSQLiteModule();
      const db = await openDatabaseAsync(BREW_DB_NAME);
      await db.execAsync(BREW_TABLE_SCHEMA);
      const alterStatements = [
        "ALTER TABLE brews ADD COLUMN fermentation_days INTEGER",
        "ALTER TABLE brews ADD COLUMN conditioning_days INTEGER"
      ];
      for (const statement of alterStatements) {
        try {
          await db.execAsync(statement);
        } catch (error) {
          // Column probably already exists; ignore
        }
      }
      return db;
    })();
  }

  return databasePromise;
}
