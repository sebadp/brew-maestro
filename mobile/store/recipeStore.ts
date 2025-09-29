import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Ingredient {
  id: string;
  name: string;
  type: 'malt' | 'hop' | 'yeast' | 'water' | 'other';
  amount: number;
  unit: string;
  time?: number; // For hops timing
  alphaAcid?: number; // For hops
  color?: number; // For malts
}

export interface Recipe {
  id: string;
  name: string;
  style: string;
  difficulty: string;
  batchSize: number; // in liters (final batch size)
  mashWater: number; // in liters (water for mashing)
  spargeWater: number; // in liters (water for sparging/lautering)
  boilTime: number; // in minutes
  og: number; // Original Gravity
  fg: number; // Final Gravity
  abv: number; // Alcohol by Volume
  ibu: number; // International Bitterness Units
  srm: number; // Standard Reference Method (color)
  efficiency: number; // Mash efficiency percentage
  ingredients: Ingredient[];
  instructions: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

interface RecipeStore {
  recipes: Recipe[];
  isLoading: boolean;
  error: string | null;

  // Actions
  loadRecipes: () => Promise<void>;
  addRecipe: (recipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateRecipe: (id: string, updates: Partial<Recipe>) => Promise<void>;
  deleteRecipe: (id: string) => Promise<void>;
  getRecipe: (id: string) => Recipe | undefined;
  clearError: () => void;
}

export const RECIPES_STORAGE_KEY = '@brewmaestro:recipes';
const DIFFICULTY_LEVELS = {
  beginner: 'Session Starter',
  intermediate: 'Craft Explorer',
  advanced: 'Maestro Challenge',
};

const createSeedTimestamp = () => new Date('2024-01-01T00:00:00.000Z').toISOString();

const DEFAULT_INSTRUCTIONS = [
  'Heat strike water to mash temperature and dough-in grains.',
  'Hold mash for 60 minutes, then raise temperature for mash out.',
  'Sparge slowly and collect wort in the kettle.',
  'Boil according to hop schedule, cooling promptly after the boil.',
  'Transfer to fermenter, oxygenate, and pitch yeast.',
  'Ferment at the recommended temperature and package once stable.',
];

const DEFAULT_RECIPES: Array<Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'>> = [
  {
    name: 'Bright Horizon Pale Ale',
    style: 'American Pale Ale',
    difficulty: DIFFICULTY_LEVELS.beginner,
    batchSize: 20,
    mashWater: 13,
    spargeWater: 11,
    boilTime: 60,
    og: 1.052,
    fg: 1.012,
    abv: 5.2,
    ibu: 35,
    srm: 8,
    efficiency: 72,
    ingredients: [
      { id: 'seed_bright_malt1', name: 'Pale Malt (2-row)', type: 'malt', amount: 4.5, unit: 'kg' },
      { id: 'seed_bright_malt2', name: 'Caramel 40', type: 'malt', amount: 0.35, unit: 'kg' },
      { id: 'seed_bright_hop1', name: 'Cascade', type: 'hop', amount: 28, unit: 'g', time: 60, alphaAcid: 5.5 },
      { id: 'seed_bright_hop2', name: 'Cascade', type: 'hop', amount: 28, unit: 'g', time: 15, alphaAcid: 5.5 },
      { id: 'seed_bright_hop3', name: 'Citra', type: 'hop', amount: 28, unit: 'g', time: 5, alphaAcid: 12 },
      { id: 'seed_bright_yeast', name: 'Safale US-05', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: DEFAULT_INSTRUCTIONS,
    notes: 'Classic citrus-forward pale ale with a crisp finish.',
  },
  {
    name: 'Summer Cloud Wheat',
    style: 'American Wheat',
    difficulty: DIFFICULTY_LEVELS.beginner,
    batchSize: 20,
    mashWater: 13,
    spargeWater: 11,
    boilTime: 60,
    og: 1.048,
    fg: 1.010,
    abv: 5.0,
    ibu: 18,
    srm: 5,
    efficiency: 72,
    ingredients: [
      { id: 'seed_summer_malt1', name: 'Wheat Malt', type: 'malt', amount: 2.8, unit: 'kg' },
      { id: 'seed_summer_malt2', name: 'Pilsner Malt', type: 'malt', amount: 2.4, unit: 'kg' },
      { id: 'seed_summer_hop1', name: 'Hallertau', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 4.5 },
      { id: 'seed_summer_hop2', name: 'Hallertau', type: 'hop', amount: 15, unit: 'g', time: 10, alphaAcid: 4.5 },
      { id: 'seed_summer_yeast', name: 'Safale K-97', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: DEFAULT_INSTRUCTIONS,
    notes: 'Soft wheat body with delicate floral hops.',
  },
  {
    name: 'Golden Patio Blonde',
    style: 'Blonde Ale',
    difficulty: DIFFICULTY_LEVELS.beginner,
    batchSize: 20,
    mashWater: 12.5,
    spargeWater: 10.8,
    boilTime: 60,
    og: 1.046,
    fg: 1.010,
    abv: 4.7,
    ibu: 20,
    srm: 6,
    efficiency: 72,
    ingredients: [
      { id: 'seed_blonde_malt1', name: 'Pale Malt (2-row)', type: 'malt', amount: 4.0, unit: 'kg' },
      { id: 'seed_blonde_malt2', name: 'Carapils', type: 'malt', amount: 0.25, unit: 'kg' },
      { id: 'seed_blonde_hop1', name: 'Willamette', type: 'hop', amount: 25, unit: 'g', time: 60, alphaAcid: 4.8 },
      { id: 'seed_blonde_hop2', name: 'Saaz', type: 'hop', amount: 20, unit: 'g', time: 10, alphaAcid: 3.5 },
      { id: 'seed_blonde_yeast', name: 'Safale US-05', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: DEFAULT_INSTRUCTIONS,
    notes: 'Easy-drinking blonde ale with a gentle hop touch.',
  },
  {
    name: 'Coastal Citrus IPA',
    style: 'American IPA',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 13.5,
    spargeWater: 11.5,
    boilTime: 60,
    og: 1.064,
    fg: 1.012,
    abv: 6.8,
    ibu: 60,
    srm: 9,
    efficiency: 72,
    ingredients: [
      { id: 'seed_coastal_malt1', name: 'Pale Malt (2-row)', type: 'malt', amount: 5.2, unit: 'kg' },
      { id: 'seed_coastal_malt2', name: 'Munich Malt', type: 'malt', amount: 0.45, unit: 'kg' },
      { id: 'seed_coastal_malt3', name: 'Caramel 20', type: 'malt', amount: 0.25, unit: 'kg' },
      { id: 'seed_coastal_hop1', name: 'Simcoe', type: 'hop', amount: 35, unit: 'g', time: 60, alphaAcid: 12.5 },
      { id: 'seed_coastal_hop2', name: 'Citra', type: 'hop', amount: 40, unit: 'g', time: 20, alphaAcid: 12.0 },
      { id: 'seed_coastal_hop3', name: 'Mosaic', type: 'hop', amount: 45, unit: 'g', time: 5, alphaAcid: 11.5 },
      { id: 'seed_coastal_hop4', name: 'Citra', type: 'hop', amount: 60, unit: 'g', time: 0, alphaAcid: 12.0 },
      { id: 'seed_coastal_yeast', name: 'Safale US-05', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: [
      'Mash at 66°C for 60 minutes and perform mash out.',
      'Collect wort and start a vigorous 60-minute boil.',
      'Follow hop schedule, reserving whirlpool addition for flameout.',
      'Cool to 18°C, oxygenate, and pitch clean American ale yeast.',
      'Dry hop heavily during days 4-6 of fermentation.',
      'Cold crash, package, and carbonate to 2.4 volumes.',
    ],
    notes: 'Bright citrus and pine with a dry finish.',
  },
  {
    name: 'Foggy Pines NEIPA',
    style: 'New England IPA',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 13.5,
    spargeWater: 11.2,
    boilTime: 60,
    og: 1.066,
    fg: 1.014,
    abv: 6.8,
    ibu: 40,
    srm: 6,
    efficiency: 70,
    ingredients: [
      { id: 'seed_foggy_malt1', name: 'Pilsner Malt', type: 'malt', amount: 4.3, unit: 'kg' },
      { id: 'seed_foggy_malt2', name: 'Flaked Oats', type: 'malt', amount: 1.0, unit: 'kg' },
      { id: 'seed_foggy_malt3', name: 'Wheat Malt', type: 'malt', amount: 0.8, unit: 'kg' },
      { id: 'seed_foggy_hop1', name: 'Magnum', type: 'hop', amount: 10, unit: 'g', time: 60, alphaAcid: 12 },
      { id: 'seed_foggy_hop2', name: 'Mosaic', type: 'hop', amount: 50, unit: 'g', time: 15, alphaAcid: 11.5 },
      { id: 'seed_foggy_hop3', name: 'Galaxy', type: 'hop', amount: 60, unit: 'g', time: 5, alphaAcid: 14 },
      { id: 'seed_foggy_hop4', name: 'El Dorado', type: 'hop', amount: 80, unit: 'g', time: 0, alphaAcid: 13 },
      { id: 'seed_foggy_hop5', name: 'Mosaic', type: 'hop', amount: 80, unit: 'g', time: 0, alphaAcid: 11.5 },
      { id: 'seed_foggy_yeast', name: 'London Ale III', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: [
      'Mash at 67°C with ample chloride-heavy water.',
      'Limit boil to 60 minutes, minimizing bittering additions.',
      'Cool to 19°C and pitch a low-flocculating English-derived yeast.',
      'Perform biotransformation dry hop at high krausen.',
      'Add second dry hop charge post-fermentation and soft crash.',
      'Package quickly to protect hop aroma; target 2.2 volumes CO₂.',
    ],
    notes: 'Hazy body bursting with tropical fruit aroma.',
  },
  {
    name: 'Ember Trail Amber',
    style: 'Amber Ale',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 13,
    spargeWater: 11,
    boilTime: 60,
    og: 1.058,
    fg: 1.014,
    abv: 5.8,
    ibu: 32,
    srm: 14,
    efficiency: 72,
    ingredients: [
      { id: 'seed_ember_malt1', name: 'Pale Malt (2-row)', type: 'malt', amount: 4.6, unit: 'kg' },
      { id: 'seed_ember_malt2', name: 'Munich Malt', type: 'malt', amount: 0.7, unit: 'kg' },
      { id: 'seed_ember_malt3', name: 'Caramel 60', type: 'malt', amount: 0.45, unit: 'kg' },
      { id: 'seed_ember_hop1', name: 'Centennial', type: 'hop', amount: 28, unit: 'g', time: 60, alphaAcid: 10 },
      { id: 'seed_ember_hop2', name: 'Cascade', type: 'hop', amount: 25, unit: 'g', time: 15, alphaAcid: 5.5 },
      { id: 'seed_ember_hop3', name: 'Amarillo', type: 'hop', amount: 25, unit: 'g', time: 5, alphaAcid: 9.5 },
      { id: 'seed_ember_yeast', name: 'Safale US-05', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: DEFAULT_INSTRUCTIONS,
    notes: 'Balanced caramel sweetness with gentle citrus hops.',
  },
  {
    name: 'Midnight Depths Imperial Stout',
    style: 'Imperial Stout',
    difficulty: DIFFICULTY_LEVELS.advanced,
    batchSize: 20,
    mashWater: 15,
    spargeWater: 12,
    boilTime: 75,
    og: 1.090,
    fg: 1.020,
    abv: 9.2,
    ibu: 70,
    srm: 40,
    efficiency: 70,
    ingredients: [
      { id: 'seed_midnight_malt1', name: 'Maris Otter', type: 'malt', amount: 7.0, unit: 'kg' },
      { id: 'seed_midnight_malt2', name: 'Munich Malt', type: 'malt', amount: 0.8, unit: 'kg' },
      { id: 'seed_midnight_malt3', name: 'Roasted Barley', type: 'malt', amount: 0.6, unit: 'kg' },
      { id: 'seed_midnight_malt4', name: 'Chocolate Malt', type: 'malt', amount: 0.45, unit: 'kg' },
      { id: 'seed_midnight_malt5', name: 'Flaked Barley', type: 'malt', amount: 0.6, unit: 'kg' },
      { id: 'seed_midnight_hop1', name: 'Magnum', type: 'hop', amount: 60, unit: 'g', time: 60, alphaAcid: 12 },
      { id: 'seed_midnight_hop2', name: 'East Kent Goldings', type: 'hop', amount: 30, unit: 'g', time: 20, alphaAcid: 5.5 },
      { id: 'seed_midnight_yeast', name: 'Nottingham Ale Yeast', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: [
      'Mash high at 68°C to build a full body.',
      'Extend boil to 75 minutes to concentrate flavors.',
      'Oxygenate wort thoroughly before pitching yeast.',
      'Ferment at 18-20°C allowing a slow warm rise.',
      'Condition on oak or cacao nibs if desired for complexity.',
      'Age cold for at least 4 weeks prior to packaging.',
    ],
    notes: 'Rich layers of chocolate, roast, and warming alcohol.',
  },
  {
    name: 'Abbey Gate Tripel',
    style: 'Belgian Tripel',
    difficulty: DIFFICULTY_LEVELS.advanced,
    batchSize: 19,
    mashWater: 12.5,
    spargeWater: 11,
    boilTime: 90,
    og: 1.082,
    fg: 1.012,
    abv: 9.2,
    ibu: 30,
    srm: 5,
    efficiency: 72,
    ingredients: [
      { id: 'seed_abbey_malt1', name: 'Pilsner Malt', type: 'malt', amount: 6.0, unit: 'kg' },
      { id: 'seed_abbey_malt2', name: 'Sugar (Candi)', type: 'other', amount: 0.9, unit: 'kg' },
      { id: 'seed_abbey_hop1', name: 'Styrian Goldings', type: 'hop', amount: 40, unit: 'g', time: 60, alphaAcid: 5.2 },
      { id: 'seed_abbey_hop2', name: 'Saaz', type: 'hop', amount: 25, unit: 'g', time: 20, alphaAcid: 3.5 },
      { id: 'seed_abbey_hop3', name: 'Saaz', type: 'hop', amount: 20, unit: 'g', time: 5, alphaAcid: 3.5 },
      { id: 'seed_abbey_yeast', name: 'Belgian Abbey Yeast', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: [
      'Mash at 65°C for 60 minutes and perform mash out.',
      'Boil for 90 minutes, adding candi sugar with 15 minutes left.',
      'Chill to 18°C and pitch a robust Belgian yeast culture.',
      'Allow free rise fermentation up to 24°C for ester profile.',
      'Condition warm for two weeks, then cold crash.',
      'Bottle condition to high carbonation (3.0 volumes).',
    ],
    notes: 'Golden, spicy, and effervescent Belgian classic.',
  },
  {
    name: 'Tidal Bloom Gose',
    style: 'Gose',
    difficulty: DIFFICULTY_LEVELS.advanced,
    batchSize: 20,
    mashWater: 12,
    spargeWater: 10.5,
    boilTime: 30,
    og: 1.048,
    fg: 1.010,
    abv: 5.0,
    ibu: 10,
    srm: 4,
    efficiency: 70,
    ingredients: [
      { id: 'seed_tidal_malt1', name: 'Pilsner Malt', type: 'malt', amount: 2.8, unit: 'kg' },
      { id: 'seed_tidal_malt2', name: 'Wheat Malt', type: 'malt', amount: 2.2, unit: 'kg' },
      { id: 'seed_tidal_other1', name: 'Sea Salt', type: 'other', amount: 14, unit: 'g' },
      { id: 'seed_tidal_other2', name: 'Coriander Seed (crushed)', type: 'other', amount: 14, unit: 'g' },
      { id: 'seed_tidal_hop1', name: 'Hallertau Mittelfruh', type: 'hop', amount: 15, unit: 'g', time: 20, alphaAcid: 4 },
      { id: 'seed_tidal_yeast', name: 'Lactobacillus Culture', type: 'other', amount: 1, unit: 'pkg' },
      { id: 'seed_tidal_yeast2', name: 'German Ale Yeast', type: 'yeast', amount: 11.5, unit: 'g' },
    ],
    instructions: [
      'Mash at 66°C and collect wort, boiling only 30 minutes.',
      'Pre-acidify wort, then cool to 40°C and pitch lactobacillus for souring.',
      'Once pH reaches target (3.3-3.5), boil briefly adding salt and coriander.',
      'Cool to 18°C and pitch German ale yeast.',
      'Ferment clean and package early to retain freshness.',
      'Carbonate to 2.8 volumes for a spritzy finish.',
    ],
    notes: 'Bright, tart, and refreshing with a hint of salinity.',
  },
  {
    name: 'American IPA Showcase',
    style: 'American IPA',
    difficulty: DIFFICULTY_LEVELS.advanced,
    batchSize: 20,
    mashWater: 17.2,
    spargeWater: 13.2,
    boilTime: 60,
    og: 1.055,
    fg: 1.013,
    abv: 5.7,
    ibu: 47,
    srm: 8,
    efficiency: 72,
    ingredients: [
      { id: 'seed_american-ipa_1', name: 'Pale Ale Malt', type: 'malt', amount: 5.0, unit: 'kg' },
      { id: 'seed_american-ipa_2', name: 'Munich Malt', type: 'malt', amount: 0.5, unit: 'kg' },
      { id: 'seed_american-ipa_3', name: 'Columbus Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 14 },
      { id: 'seed_american-ipa_4', name: 'Columbus Hops', type: 'hop', amount: 20, unit: 'g', time: 10, alphaAcid: 14 },
      { id: 'seed_american-ipa_5', name: 'Mosaic Hops (dry hop)', type: 'hop', amount: 40, unit: 'g' },
      { id: 'seed_american-ipa_6', name: 'SafAle US-05', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_american-ipa_7', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 15 },
      { id: 'seed_american-ipa_8', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Heat mash water to 66°C and mash grains for 60 minutes.',
      'Sparge with hot water to collect wort and bring to a 60-minute boil.',
      'Add Columbus hops at the start of the boil and again with 10 minutes remaining; add Irish Moss at 15 minutes left.',
      'Chill wort to 18°C and pitch SafAle US-05 yeast.',
      'Ferment at 18°C; add Mosaic hops as a dry hop on day 4.',
      'Cold condition the beer and add gelatin prior to packaging for clarity.',
    ],
    notes: 'Dry hop on day 4 of fermentation; keep fermentation temperature steady at 18°C.',
  },
  {
    name: 'Golden Abbey Blond',
    style: 'Belgian Blond Ale',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 13,
    boilTime: 60,
    og: 1.065,
    fg: 1.015,
    abv: 6.3,
    ibu: 20,
    srm: 7,
    efficiency: 72,
    ingredients: [
      { id: 'seed_belgian-blond-ale_1', name: 'Pilsner Malt', type: 'malt', amount: 5.0, unit: 'kg' },
      { id: 'seed_belgian-blond-ale_2', name: 'Caramel 20 Malt', type: 'malt', amount: 0.3, unit: 'kg', color: 20 },
      { id: 'seed_belgian-blond-ale_3', name: 'Munich Malt', type: 'malt', amount: 0.5, unit: 'kg' },
      { id: 'seed_belgian-blond-ale_4', name: 'Biscuit Malt', type: 'malt', amount: 0.2, unit: 'kg' },
      { id: 'seed_belgian-blond-ale_5', name: 'Hallertauer Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 4 },
      { id: 'seed_belgian-blond-ale_6', name: 'Saaz Hops', type: 'hop', amount: 20, unit: 'g', time: 15, alphaAcid: 3.5 },
      { id: 'seed_belgian-blond-ale_7', name: 'SafAle T-58', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_belgian-blond-ale_8', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 5 },
      { id: 'seed_belgian-blond-ale_9', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash grains at 65°C for 60 minutes using 18 L of water.',
      'Sparge with 13 L and boil for 60 minutes, adding Hallertauer at the start and Saaz with 15 minutes remaining.',
      'Add Irish Moss with 5 minutes left in the boil.',
      'Cool wort to 20°C and pitch SafAle T-58 yeast.',
      'Ferment at 20°C and cold condition with gelatin to brighten the beer.',
      'Package once gravity is stable and the beer has cleared.',
    ],
    notes: 'Delicate Belgian profile—allow warm fermentation for ester development.',
  },
  {
    name: 'Old Harbour English IPA',
    style: 'English IPA',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 13,
    boilTime: 60,
    og: 1.057,
    fg: 1.014,
    abv: 5.6,
    ibu: 47,
    srm: 10,
    efficiency: 72,
    ingredients: [
      { id: 'seed_english-ipa_1', name: 'Pale Ale Malt', type: 'malt', amount: 5.0, unit: 'kg' },
      { id: 'seed_english-ipa_2', name: 'Aromatic Amber Malt', type: 'malt', amount: 0.2, unit: 'kg' },
      { id: 'seed_english-ipa_3', name: 'Caramel 50 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 50 },
      { id: 'seed_english-ipa_4', name: 'Aroma 150 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 150 },
      { id: 'seed_english-ipa_5', name: 'Cascade Hops', type: 'hop', amount: 40, unit: 'g', time: 60, alphaAcid: 5.5 },
      { id: 'seed_english-ipa_6', name: 'Cascade Hops', type: 'hop', amount: 20, unit: 'g', time: 30, alphaAcid: 5.5 },
      { id: 'seed_english-ipa_7', name: 'Styrian Golding Hops', type: 'hop', amount: 10, unit: 'g', time: 10, alphaAcid: 5 },
      { id: 'seed_english-ipa_8', name: 'SafAle S-04', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_english-ipa_9', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 15 },
      { id: 'seed_english-ipa_10', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash at 67°C for 60 minutes with 18 L of water.',
      'Sparge with 13 L and boil for 60 minutes.',
      'Hop schedule: Cascade at 60 minutes, Cascade at 30 minutes, Styrian Golding at 10 minutes; add Irish Moss with 15 minutes remaining.',
      'Chill to 20°C and pitch SafAle S-04 yeast.',
      'Ferment at 20°C and cold condition with gelatin for clarity.',
      'Bottle or keg once gravity stabilizes.',
    ],
    notes: 'Layered hop additions deliver classic English IPA character; keep fermentation steady at 20°C.',
  },
  {
    name: 'Suncrest Honey Ale',
    style: 'Honey Ale',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 12,
    boilTime: 60,
    og: 1.062,
    fg: 1.016,
    abv: 6.0,
    ibu: 22,
    srm: 6,
    efficiency: 72,
    ingredients: [
      { id: 'seed_honey_1', name: 'Pilsner Malt', type: 'malt', amount: 5.0, unit: 'kg' },
      { id: 'seed_honey_2', name: 'Caramel 50 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 50 },
      { id: 'seed_honey_3', name: 'Cascade Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 5.5 },
      { id: 'seed_honey_4', name: 'Styrian Golding Hops', type: 'hop', amount: 10, unit: 'g', time: 30, alphaAcid: 5 },
      { id: 'seed_honey_5', name: 'Pure Honey', type: 'other', amount: 1.0, unit: 'kg' },
      { id: 'seed_honey_6', name: 'SafAle S-04', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_honey_7', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 15 },
      { id: 'seed_honey_8', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash grains at 66°C for 60 minutes with 18 L of water.',
      'Sparge with 12 L and boil for 60 minutes.',
      'Add Cascade hops at the start of the boil, Styrian Golding at 30 minutes, and Irish Moss with 15 minutes remaining.',
      'Stir in honey with 10 minutes left in the boil to preserve aromatics.',
      'Chill to 18°C and pitch SafAle S-04 yeast.',
      'Ferment at 18°C and cold condition with gelatin before packaging.',
    ],
    notes: 'Add honey late in the boil to retain delicate aromas; maintain consistent fermentation temperature at 18°C.',
  },
  {
    name: 'Rheinland Altbier',
    style: 'Altbier',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 13,
    boilTime: 60,
    og: 1.05,
    fg: 1.013,
    abv: 4.9,
    ibu: 20,
    srm: 13,
    efficiency: 72,
    ingredients: [
      { id: 'seed_altbier_1', name: 'Pilsner Malt', type: 'malt', amount: 4.0, unit: 'kg' },
      { id: 'seed_altbier_2', name: 'Munich Malt', type: 'malt', amount: 0.6, unit: 'kg' },
      { id: 'seed_altbier_3', name: 'Special B Malt', type: 'malt', amount: 0.2, unit: 'kg' },
      { id: 'seed_altbier_4', name: 'Aroma 150 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 150 },
      { id: 'seed_altbier_5', name: 'Hallertauer Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 4 },
      { id: 'seed_altbier_6', name: 'Saaz Hops', type: 'hop', amount: 20, unit: 'g', time: 15, alphaAcid: 3.5 },
      { id: 'seed_altbier_7', name: 'SafAle K-97', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_altbier_8', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 5 },
      { id: 'seed_altbier_9', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash at 66°C for 60 minutes with 18 L of water.',
      'Sparge with 13 L and boil for 60 minutes.',
      'Add Hallertauer at the start of the boil and Saaz with 15 minutes remaining; add Irish Moss with 5 minutes left.',
      'Cool to 16°C and pitch SafAle K-97 yeast.',
      'Ferment cool (15-18°C) for clean profile, then cold condition with gelatin.',
      'Package after conditioning to taste.',
    ],
    notes: 'Keep fermentation toward the cool end to accentuate malt richness and crisp finish.',
  },
  {
    name: 'Copper Crest Amber Ale',
    style: 'American Amber Ale',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 14,
    boilTime: 60,
    og: 1.057,
    fg: 1.013,
    abv: 5.8,
    ibu: 30,
    srm: 12,
    efficiency: 72,
    ingredients: [
      { id: 'seed_american-amber-ale_1', name: 'Pale Ale Malt', type: 'malt', amount: 5.0, unit: 'kg' },
      { id: 'seed_american-amber-ale_2', name: 'Munich Malt', type: 'malt', amount: 0.2, unit: 'kg' },
      { id: 'seed_american-amber-ale_3', name: 'Caramel 80 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 80 },
      { id: 'seed_american-amber-ale_4', name: 'Medium Crystal Malt', type: 'malt', amount: 0.3, unit: 'kg' },
      { id: 'seed_american-amber-ale_5', name: 'Nugget Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 13 },
      { id: 'seed_american-amber-ale_6', name: 'Victoria Hops (whirlpool)', type: 'hop', amount: 40, unit: 'g' },
      { id: 'seed_american-amber-ale_7', name: 'SafAle US-05', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_american-amber-ale_8', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 10 },
      { id: 'seed_american-amber-ale_9', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash at 66°C for 60 minutes with 18 L of water.',
      'Sparge with 14 L and boil for 60 minutes.',
      'Add Nugget hops at the start of the boil and Irish Moss with 10 minutes remaining.',
      'At whirlpool, add Victoria hops before chilling.',
      'Chill to 20°C, pitch SafAle US-05 yeast, and ferment at 20°C.',
      'Cold condition with gelatin for a brilliant amber hue.',
    ],
    notes: 'Whirlpool addition supplies vibrant hop aroma; hold fermentation at 20°C for balance.',
  },
  {
    name: 'Amber Lager Kokken',
    style: 'Amber Lager',
    difficulty: DIFFICULTY_LEVELS.beginner,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 14,
    boilTime: 60,
    og: 1.05,
    fg: 1.009,
    abv: 5.4,
    ibu: 15,
    srm: 14,
    efficiency: 72,
    ingredients: [
      { id: 'seed_amber-lager_1', name: 'Pilsner Malt', type: 'malt', amount: 4.0, unit: 'kg' },
      { id: 'seed_amber-lager_2', name: 'Caramel 60 Malt', type: 'malt', amount: 0.5, unit: 'kg', color: 60 },
      { id: 'seed_amber-lager_3', name: 'Caramel 120 Malt', type: 'malt', amount: 0.2, unit: 'kg', color: 120 },
      { id: 'seed_amber-lager_4', name: 'Cascade Hops', type: 'hop', amount: 20, unit: 'g', time: 60, alphaAcid: 5.5 },
      { id: 'seed_amber-lager_5', name: 'SafLager W34/70', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_amber-lager_6', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 10 },
      { id: 'seed_amber-lager_7', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash at 66°C for 60 minutes with 18 L of water.',
      'Sparge with 14 L and boil for 60 minutes.',
      'Add Cascade hops at the start of the boil and Irish Moss with 10 minutes remaining.',
      'Cool to 12-15°C if possible and pitch SafLager W34/70 yeast.',
      'Ferment cool and lager the beer for at least one week with gelatin for clarity.',
      'Package and carbonate to a crisp finish.',
    ],
    notes: 'Keeps steps simple for new lager brewers—extended cold conditioning enhances drinkability.',
  },
  {
    name: 'Abadía Argenta Dubbel',
    style: 'Belgian Dubbel',
    difficulty: DIFFICULTY_LEVELS.intermediate,
    batchSize: 20,
    mashWater: 18,
    spargeWater: 12,
    boilTime: 60,
    og: 1.054,
    fg: 1.014,
    abv: 5.3,
    ibu: 16,
    srm: 16,
    efficiency: 72,
    ingredients: [
      { id: 'seed_abadia-argenta-ale_1', name: 'Pilsner Malt', type: 'malt', amount: 4.0, unit: 'kg' },
      { id: 'seed_abadia-argenta-ale_2', name: 'Caramel 140 Malt', type: 'malt', amount: 0.4, unit: 'kg', color: 140 },
      { id: 'seed_abadia-argenta-ale_3', name: 'Candi Sugar', type: 'other', amount: 0.5, unit: 'kg' },
      { id: 'seed_abadia-argenta-ale_4', name: 'Nugget Hops', type: 'hop', amount: 10, unit: 'g', time: 60, alphaAcid: 13 },
      { id: 'seed_abadia-argenta-ale_5', name: 'Nugget Hops', type: 'hop', amount: 10, unit: 'g', time: 10, alphaAcid: 13 },
      { id: 'seed_abadia-argenta-ale_6', name: 'SafAle T-58', type: 'yeast', amount: 11.5, unit: 'g' },
      { id: 'seed_abadia-argenta-ale_7', name: 'Irish Moss', type: 'other', amount: 2, unit: 'g', time: 5 },
      { id: 'seed_abadia-argenta-ale_8', name: 'Beer Gelatin', type: 'other', amount: 2, unit: 'g' },
    ],
    instructions: [
      'Mash at 65°C for 60 minutes with 18 L of water.',
      'Sparge with 12 L and boil for 60 minutes.',
      'Add Nugget hops at the start of the boil and again with 10 minutes remaining; add Irish Moss with 5 minutes left.',
      'Stir in candi sugar at flameout and ensure it dissolves completely.',
      'Cool wort to 20°C and pitch SafAle T-58 yeast.',
      'Ferment warm for Belgian esters and cold condition with gelatin for clarity.',
    ],
    notes: 'Belgian-inspired dubbel—sugar addition boosts dryness while keeping body light.',
  },
];

// Helper functions for calculations
export const calculateABV = (og: number, fg: number): number => {
  if (!og || !fg) return 0;

  // Handle different input formats: 1.032 or 1032
  let normalizedOG = og;
  let normalizedFG = fg;

  // If values are > 100, assume they're in format like 1032 instead of 1.032
  if (og > 100) normalizedOG = og / 1000;
  if (fg > 100) normalizedFG = fg / 1000;

  if (normalizedOG <= normalizedFG || normalizedOG < 1.000 || normalizedFG < 0.990) return 0;

  // Convert specific gravity to gravity points (1.032 → 32 points)
  const ogPoints = (normalizedOG - 1) * 1000;
  const fgPoints = (normalizedFG - 1) * 1000;
  // Standard formula: ABV = (OG points - FG points) × 0.131
  return Math.round(((ogPoints - fgPoints) * 0.131) * 100) / 100;
};

export const calculateIBU = (
  hopAmount: number, // in grams
  alphaAcid: number, // percentage
  boilTime: number, // in minutes
  batchSize: number, // in liters
  og: number
): number => {
  // Simplified Tinseth formula
  const utilizationFactor = 1.65 * Math.pow(0.000125, og - 1);
  const timeDecayFactor = (1 - Math.exp(-0.04 * boilTime)) / 4.15;
  const utilization = utilizationFactor * timeDecayFactor;

  const ibu = (hopAmount * alphaAcid * utilization * 1000) / batchSize;
  return Math.round(ibu * 10) / 10;
};

// Water calculation helpers
export const calculateMashWater = (grainWeight: number, ratio: number = 3): number => {
  // Default ratio of 3 liters per kg of grain
  return Math.round((grainWeight * ratio) * 10) / 10;
};

export const calculateSpargeWater = (
  batchSize: number,
  mashWater: number,
  grainAbsorption: number = 1.04 // liters per kg of grain
): number => {
  // Calculate sparge water needed to reach final batch size
  // accounting for grain absorption and boil-off
  const boilOff = batchSize * 0.15; // Assume 15% boil-off
  const totalWaterNeeded = batchSize + boilOff;
  const spargeWater = totalWaterNeeded - mashWater + grainAbsorption;
  return Math.round(spargeWater * 10) / 10;
};

export const calculateTotalWater = (mashWater: number, spargeWater: number): number => {
  return Math.round((mashWater + spargeWater) * 10) / 10;
};

const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  error: null,

  loadRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await AsyncStorage.getItem(RECIPES_STORAGE_KEY);
      const rawRecipes = stored ? JSON.parse(stored) : [];

      if (!stored || rawRecipes.length === 0) {
        const seededRecipes = DEFAULT_RECIPES.map((recipe, index) => ({
          ...recipe,
          id: `seed_recipe_${index}`,
          createdAt: createSeedTimestamp(),
          updatedAt: createSeedTimestamp(),
        }));

        await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(seededRecipes));
        set({ recipes: seededRecipes, isLoading: false });
        return;
      }

      // Migrate old recipes to include water fields if they don't exist
      let recipes: Recipe[] = rawRecipes.map((recipe: any) => {
        // If recipe doesn't have water fields, calculate defaults
        let migrated = { ...recipe };

        if (!recipe.mashWater || !recipe.spargeWater) {
          const totalGrainWeight = recipe.ingredients
            ?.filter((ing: Ingredient) => ing.type === 'malt')
            .reduce((sum: number, ing: Ingredient) => sum + ing.amount, 0) || 0;

          const mashWater = calculateMashWater(totalGrainWeight);
          const spargeWater = calculateSpargeWater(recipe.batchSize, mashWater, totalGrainWeight * 1.04);

          migrated = {
            ...migrated,
            mashWater: recipe.mashWater || mashWater,
            spargeWater: recipe.spargeWater || spargeWater,
          };
        }
        return {
          ...migrated,
          difficulty: migrated.difficulty ?? 'Custom Craft',
        };
      });

      const seedRecipes = DEFAULT_RECIPES.map((recipe, index) => ({
        ...recipe,
        id: `seed_recipe_${index}`,
        createdAt: createSeedTimestamp(),
        updatedAt: createSeedTimestamp(),
      }));

      let recipesUpdated = false;
      const existingIds = new Set(recipes.map((recipe: Recipe) => recipe.id));

      seedRecipes.forEach(seed => {
        if (!existingIds.has(seed.id)) {
          recipes = [...recipes, seed];
          recipesUpdated = true;
        }
      });

      if (recipesUpdated) {
        await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(recipes));
      }

      set({ recipes, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to load recipes', isLoading: false });
    }
  },

  addRecipe: async (recipeData) => {
    set({ isLoading: true, error: null });
    try {
      const recipe: Recipe = {
        ...recipeData,
        difficulty: recipeData.difficulty ?? 'Custom Craft',
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const currentRecipes = get().recipes;
      const updatedRecipes = [...currentRecipes, recipe];

      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
      set({ recipes: updatedRecipes, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to add recipe', isLoading: false });
    }
  },

  updateRecipe: async (id, updates) => {
    set({ isLoading: true, error: null });
    try {
      const currentRecipes = get().recipes;
      const updatedRecipes = currentRecipes.map(recipe =>
        recipe.id === id
          ? { ...recipe, ...updates, updatedAt: new Date().toISOString() }
          : recipe
      );

      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
      set({ recipes: updatedRecipes, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to update recipe', isLoading: false });
    }
  },

  deleteRecipe: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const currentRecipes = get().recipes;
      const updatedRecipes = currentRecipes.filter(recipe => recipe.id !== id);

      await AsyncStorage.setItem(RECIPES_STORAGE_KEY, JSON.stringify(updatedRecipes));
      set({ recipes: updatedRecipes, isLoading: false });
    } catch (error) {
      set({ error: 'Failed to delete recipe', isLoading: false });
    }
  },

  getRecipe: (id) => {
    return get().recipes.find(recipe => recipe.id === id);
  },

  clearError: () => {
    set({ error: null });
  },
}));

export default useRecipeStore;
