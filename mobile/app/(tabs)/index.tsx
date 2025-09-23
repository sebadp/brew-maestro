import React, { useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import useRecipeStore, { Recipe } from '../../store/recipeStore';
import { createShadow } from '../../utils/shadows';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

interface RecipeCardProps {
  recipe: Recipe;
  onPress: () => void;
}

const RecipeCard: React.FC<RecipeCardProps> = ({ recipe, onPress }) => (
  <TouchableOpacity style={styles.recipeCard} onPress={onPress}>
    <View style={styles.recipeHeader}>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <View style={styles.statusBadge}>
        <Text style={styles.statusText}>Recipe</Text>
      </View>
    </View>
    <Text style={styles.recipeStyle}>{recipe.style}</Text>
    <View style={styles.recipeStats}>
      <Text style={styles.statText}>ABV: {recipe.abv.toFixed(1)}%</Text>
      <Text style={styles.statText}>IBU: {recipe.ibu}</Text>
      <Text style={styles.statText}>OG: {recipe.og.toFixed(3)}</Text>
      <Text style={styles.statText}>FG: {recipe.fg.toFixed(3)}</Text>
    </View>
  </TouchableOpacity>
);

export default function RecipesScreen() {
  const router = useRouter();
  const { recipes, loadRecipes, isLoading } = useRecipeStore();

  useEffect(() => {
    loadRecipes();
  }, [loadRecipes]);

  const handleRecipePress = (recipeId: string) => {
    router.push(`/recipe/${recipeId}`);
  };

  const handleNewRecipe = () => {
    router.push('/recipe/new');
  };

  if (recipes.length === 0 && !isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Your Recipes</Text>
          <TouchableOpacity style={styles.fab} onPress={handleNewRecipe}>
            <MaterialCommunityIcons name="plus" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.emptyState}>
          <MaterialCommunityIcons name="flask-outline" size={80} color="#CCC" />
          <Text style={styles.emptyTitle}>No Recipes Yet</Text>
          <Text style={styles.emptySubtitle}>
            Create your first recipe to start brewing!
          </Text>
          <TouchableOpacity style={styles.createButton} onPress={handleNewRecipe}>
            <Text style={styles.createButtonText}>Create First Recipe</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Your Recipes</Text>
        <TouchableOpacity style={styles.fab} onPress={handleNewRecipe}>
          <MaterialCommunityIcons name="plus" size={24} color="white" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={recipes}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <RecipeCard
            recipe={item}
            onPress={() => handleRecipePress(item.id)}
          />
        )}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshing={isLoading}
        onRefresh={loadRecipes}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
  },
  fab: {
    backgroundColor: MAESTRO_GOLD,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    ...createShadow('#000', { width: 0, height: 2 }, 0.25, 4, 4),
  },
  listContainer: {
    padding: 20,
    paddingTop: 0,
  },
  recipeCard: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  recipeHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  recipeName: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: HOP_GREEN,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '500',
  },
  recipeStyle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  recipeStats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: 12,
    color: DEEP_BREW,
    fontWeight: '500',
  },
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: DEEP_BREW,
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  createButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 12,
  },
  createButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});