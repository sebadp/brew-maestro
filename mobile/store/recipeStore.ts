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
  batchSize: number; // in liters
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
  return Math.round(((og - fg) * 131.25) * 100) / 100;
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

  const ibu = (hopAmount * alphaAcid * utilization * 1000) / (batchSize * 10);
  return Math.round(ibu * 10) / 10;
};

const useRecipeStore = create<RecipeStore>((set, get) => ({
  recipes: [],
  isLoading: false,
  error: null,

  loadRecipes: async () => {
    set({ isLoading: true, error: null });
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const recipes = stored ? JSON.parse(stored) : [];
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