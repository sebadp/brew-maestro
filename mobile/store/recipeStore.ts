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

const STORAGE_KEY = '@brewmaestro:recipes';

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
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const rawRecipes = stored ? JSON.parse(stored) : [];

      // Migrate old recipes to include water fields if they don't exist
      const recipes = rawRecipes.map((recipe: any) => {
        // If recipe doesn't have water fields, calculate defaults
        if (!recipe.mashWater || !recipe.spargeWater) {
          const totalGrainWeight = recipe.ingredients
            ?.filter((ing: Ingredient) => ing.type === 'malt')
            .reduce((sum: number, ing: Ingredient) => sum + ing.amount, 0) || 0;

          const mashWater = calculateMashWater(totalGrainWeight);
          const spargeWater = calculateSpargeWater(recipe.batchSize, mashWater, totalGrainWeight * 1.04);

          return {
            ...recipe,
            mashWater: recipe.mashWater || mashWater,
            spargeWater: recipe.spargeWater || spargeWater,
          };
        }
        return recipe;
      });

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
        id: Date.now().toString(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      const currentRecipes = get().recipes;
      const updatedRecipes = [...currentRecipes, recipe];

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
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

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
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

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updatedRecipes));
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