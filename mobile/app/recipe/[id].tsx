import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useRecipeStore from '../../store/recipeStore';
import useBrewSessionStore from '../../store/brewSessionStore';
import { createShadow } from '../../utils/shadows';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

export default function RecipeDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { getRecipe } = useRecipeStore();
  const { startSession } = useBrewSessionStore();

  const recipe = id ? getRecipe(id) : null;

  useEffect(() => {
    if (!recipe) {
      Alert.alert('Recipe not found', 'This recipe could not be loaded.', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    }
  }, [recipe, router]);

  const handleStartBrew = async () => {
    if (!recipe) return;

    Alert.alert(
      'Start Brew Session',
      'This will start a guided brewing session for this recipe.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Start',
          onPress: async () => {
            await startSession(recipe);
            router.push('/(tabs)/brew');
          }
        }
      ]
    );
  };

  const handleEditRecipe = () => {
    router.push(`/recipe/edit/${id}`);
  };

  if (!recipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <MaterialCommunityIcons name="alert-circle" size={64} color="#E74C3C" />
          <Text style={styles.errorText}>Recipe not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.recipeName}>{recipe.name}</Text>
          <Text style={styles.recipeStyle}>{recipe.style}</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipe.abv.toFixed(1)}%</Text>
            <Text style={styles.statLabel}>ABV</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipe.ibu}</Text>
            <Text style={styles.statLabel}>IBU</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipe.og.toFixed(3)}</Text>
            <Text style={styles.statLabel}>OG</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{recipe.fg.toFixed(3)}</Text>
            <Text style={styles.statLabel}>FG</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.cardTitle}>Batch Info</Text>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Batch Size:</Text>
            <Text style={styles.infoValue}>{recipe.batchSize}L</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Boil Time:</Text>
            <Text style={styles.infoValue}>{recipe.boilTime} min</Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Efficiency:</Text>
            <Text style={styles.infoValue}>{recipe.efficiency}%</Text>
          </View>
        </View>

        <View style={styles.ingredientsCard}>
          <Text style={styles.cardTitle}>Ingredients</Text>

          {/* Malts */}
          <View style={styles.ingredientSection}>
            <Text style={styles.sectionTitle}>Fermentables</Text>
            {recipe.ingredients
              .filter(ing => ing.type === 'malt')
              .map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                </View>
              ))}
          </View>

          {/* Hops */}
          <View style={styles.ingredientSection}>
            <Text style={styles.sectionTitle}>Hops</Text>
            {recipe.ingredients
              .filter(ing => ing.type === 'hop')
              .map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <View style={styles.hopInfo}>
                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                    <Text style={styles.hopDetails}>
                      {ingredient.alphaAcid}% AA - {ingredient.time} min
                    </Text>
                  </View>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                </View>
              ))}
          </View>

          {/* Yeast */}
          <View style={styles.ingredientSection}>
            <Text style={styles.sectionTitle}>Yeast</Text>
            {recipe.ingredients
              .filter(ing => ing.type === 'yeast')
              .map((ingredient, index) => (
                <View key={index} style={styles.ingredientRow}>
                  <Text style={styles.ingredientName}>{ingredient.name}</Text>
                  <Text style={styles.ingredientAmount}>
                    {ingredient.amount} {ingredient.unit}
                  </Text>
                </View>
              ))}
          </View>
        </View>

        {recipe.notes && (
          <View style={styles.notesCard}>
            <Text style={styles.cardTitle}>Notes</Text>
            <Text style={styles.notesText}>{recipe.notes}</Text>
          </View>
        )}

        <View style={styles.actionButtons}>
          <TouchableOpacity style={styles.editButton} onPress={handleEditRecipe}>
            <MaterialCommunityIcons name="pencil" size={20} color={DEEP_BREW} />
            <Text style={styles.editButtonText}>Edit Recipe</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.brewButton} onPress={handleStartBrew}>
            <MaterialCommunityIcons name="fire" size={20} color="white" />
            <Text style={styles.brewButtonText}>Start Brewing</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    color: '#E74C3C',
    marginTop: 16,
  },
  header: {
    padding: 20,
    paddingBottom: 0,
  },
  recipeName: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
    marginBottom: 4,
  },
  recipeStyle: {
    fontSize: 16,
    color: '#666',
  },
  statsGrid: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    alignItems: 'center',
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: MAESTRO_GOLD,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  infoCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 16,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '500',
    color: DEEP_BREW,
  },
  ingredientsCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  ingredientSection: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: HOP_GREEN,
    marginBottom: 12,
  },
  ingredientRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  hopInfo: {
    flex: 1,
  },
  ingredientName: {
    fontSize: 14,
    fontWeight: '500',
    color: DEEP_BREW,
  },
  hopDetails: {
    fontSize: 12,
    color: '#666',
    marginTop: 2,
  },
  ingredientAmount: {
    fontSize: 14,
    fontWeight: '500',
    color: MAESTRO_GOLD,
  },
  notesCard: {
    backgroundColor: 'white',
    margin: 20,
    marginTop: 0,
    borderRadius: 16,
    padding: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  notesText: {
    fontSize: 14,
    lineHeight: 20,
    color: DEEP_BREW,
  },
  actionButtons: {
    flexDirection: 'row',
    padding: 20,
    gap: 12,
  },
  editButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    gap: 8,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: '500',
    color: DEEP_BREW,
  },
  brewButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: MAESTRO_GOLD,
    paddingVertical: 16,
    borderRadius: 12,
    gap: 8,
  },
  brewButtonText: {
    fontSize: 16,
    fontWeight: '600',
    color: 'white',
  },
});