import React, { useMemo, useRef, useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Animated,
  Modal,
  Alert,
} from 'react-native';
import { MaterialCommunityIcons, MaterialIcons } from '@expo/vector-icons';
import useRecipeStore, { Recipe } from '../../store/recipeStore';
import { useBrewTrackerStore, BrewRecord } from '../../store/brewTrackerStore';
import { isSQLiteAvailable } from '../../database/brewDb';
import { useRouter } from 'expo-router';
import { createShadow } from '../../utils/shadows';
import useBrewSessionStore from '../../store/brewSessionStore';

const GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

const formatBrewStatus = (brew: BrewRecord, fermentationDay: number) => {
  switch (brew.status) {
    case 'fermenting':
      return `Fermentando · Día ${fermentationDay}`;
    case 'conditioning':
      return 'Madurando';
    case 'brewing':
      return 'Cocción activa';
    default:
      return 'Próximos pasos';
  }
};

const getRecentRecipes = (recipes: Recipe[]) => {
  return recipes.slice(-5).reverse();
};

export default function HomeScreen() {
  const router = useRouter();
  const { recipes, loadRecipes, getRecipe } = useRecipeStore(state => ({
    recipes: state.recipes,
    loadRecipes: state.loadRecipes,
    getRecipe: state.getRecipe,
  }));
  const { activeBrews, getFermentationDay } = useBrewTrackerStore(state => ({
    activeBrews: state.activeBrews,
    getFermentationDay: state.getFermentationDay,
  }));
  const { startSession } = useBrewSessionStore(state => ({
    startSession: state.startSession,
  }));

  const [chooseRecipeVisible, setChooseRecipeVisible] = useState(false);

  useEffect(() => {
    if (recipes.length === 0) {
      loadRecipes();
    }
  }, [recipes.length, loadRecipes]);

  const activeBrew = useMemo(() => (activeBrews.length > 0 ? activeBrews[0] : null), [activeBrews]);
  const fermentationDay = activeBrew ? getFermentationDay(activeBrew) : 0;
  const recentRecipes = useMemo(() => getRecentRecipes(recipes), [recipes]);

  const showBrewCard = Boolean(activeBrew && isSQLiteAvailable);

  const handleOpenBrewPrompt = () => {
    setChooseRecipeVisible(true);
  };

  const handleCreateBrew = async (reference: { id?: string; name: string; batchSize?: number }) => {
    if (reference.id) {
      const recipe = getRecipe(reference.id);
      if (!recipe) {
        Alert.alert('Receta no encontrada', 'Actualiza tus recetas y vuelve a intentarlo.');
        return;
      }

      try {
        await startSession(recipe);
        setChooseRecipeVisible(false);
        router.push('/(tabs)/brew');
      } catch (error) {
        Alert.alert('Error', 'No se pudo iniciar la sesión de brew.');
      }
      return;
    }

    setChooseRecipeVisible(false);
    router.push('/recipe/new');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.subTitle}>Hola, maestro cervecero</Text>
          <Text style={styles.title}>¿Listo para tu próximo brew?</Text>
        </View>

        <View style={styles.activeCardContainer}>
          {showBrewCard ? (
            <ActiveBrewCard brew={activeBrew!} fermentationDay={fermentationDay} />
          ) : (
            <TouchableOpacity
              style={[styles.emptyBrewCard, createShadow('#000', { width: 0, height: 4 }, 0.08, 12, 8)]}
              onPress={handleOpenBrewPrompt}
            >
              <MaterialCommunityIcons name="flask-outline" size={36} color={GOLD} />
              <Text style={styles.emptyBrewTitle}>No hay cocciones activas</Text>
              <Text style={styles.emptyBrewSubtitle}>
                Crea tu primera receta o inicia un nuevo brew day para comenzar el seguimiento.
              </Text>
              <View style={styles.inlineActions}>
                <TouchableOpacity
                  style={[styles.inlineButton, styles.inlinePrimary]}
                  onPress={handleOpenBrewPrompt}
                >
                  <Text style={styles.inlinePrimaryText}>Nueva Cocción</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.inlineButton}
                  onPress={() => router.push('/recipe/new')}
                >
                  <Text style={styles.inlineSecondaryText}>Crear Receta</Text>
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
        </View>

        <View style={styles.actionsRow}>
          <TouchableOpacity style={[styles.actionButton, styles.actionPrimary]} onPress={handleOpenBrewPrompt}>
            <MaterialCommunityIcons name="plus" color={DEEP_BREW} size={20} />
            <Text style={styles.actionPrimaryText}>Nueva Cocción</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.actionButton, styles.actionSecondary]}
            onPress={() => router.push('/(tabs)/calculator')}
          >
            <MaterialIcons name="calculate" color="white" size={20} />
            <Text style={styles.actionSecondaryText}>Calculadora</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Recetas Recientes</Text>
          <TouchableOpacity onPress={() => router.push('/(tabs)/index')}>
            <Text style={styles.viewAll}>Ver todas</Text>
          </TouchableOpacity>
        </View>

        {recentRecipes.length > 0 ? (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.recipeScroll}
          >
            {recentRecipes.map(recipe => (
              <RecipeCard key={recipe.id} recipe={recipe} onPress={() => router.push({ pathname: '/recipe/[id]', params: { id: recipe.id } })} />
            ))}
          </ScrollView>
        ) : (
          <View style={[styles.noRecipesCard, createShadow('#000', { width: 0, height: 2 }, 0.06, 8, 4)]}>
            <Text style={styles.noRecipesText}>Aún no tienes recetas guardadas.</Text>
            <TouchableOpacity onPress={() => router.push('/recipe/new')}>
              <Text style={styles.noRecipesAction}>Crear primera receta</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      <Modal visible={chooseRecipeVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una receta</Text>
            <ScrollView style={styles.modalList}>
              {recipes.map(recipe => (
                <TouchableOpacity
                  key={recipe.id}
                  style={styles.modalItem}
                  onPress={() => handleCreateBrew({ id: recipe.id, name: recipe.name, batchSize: recipe.batchSize })}
                >
                  <Text style={styles.modalItemTitle}>{recipe.name}</Text>
                  <Text style={styles.modalItemSubtitle}>{recipe.style}</Text>
                </TouchableOpacity>
              ))}
              {recipes.length === 0 && (
                <Text style={styles.modalEmpty}>Aún no hay recetas guardadas.</Text>
              )}
            </ScrollView>

            <TouchableOpacity
              style={[styles.modalItem, styles.modalManual]}
              onPress={() => handleCreateBrew({ name: `Batch ${new Date().toLocaleDateString()}` })}
            >
              <Text style={styles.modalItemTitle}>Crear lote manual</Text>
              <Text style={styles.modalItemSubtitle}>Define la receta sobre la marcha</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.modalClose} onPress={() => setChooseRecipeVisible(false)}>
              <Text style={styles.modalCloseText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const ActiveBrewCard = ({ brew, fermentationDay }: { brew: BrewRecord; fermentationDay: number }) => {
  const temperature = brew.fermentationTemp ?? 18;
  const statusText = formatBrewStatus(brew, fermentationDay);
  const bubbleAnim = useRef(new Animated.Value(0)).current;
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (brew.status === 'fermenting') {
      animationRef.current?.stop();
      animationRef.current = Animated.loop(
        Animated.sequence([
          Animated.timing(bubbleAnim, { toValue: -10, duration: 1500, useNativeDriver: true }),
          Animated.timing(bubbleAnim, { toValue: 0, duration: 1500, useNativeDriver: true }),
        ])
      );
      animationRef.current.start();
    } else {
      animationRef.current?.stop();
      bubbleAnim.setValue(0);
    }

    return () => {
      animationRef.current?.stop();
    };
  }, [brew.status, bubbleAnim]);

  return (
    <View style={[styles.brewCard, createShadow('#000', { width: 0, height: 4 }, 0.12, 12, 8)]}>
      <View style={styles.brewCardHeader}>
        <View>
          <Text style={styles.brewTitle}>{brew.recipeName}</Text>
          <Text style={styles.brewStatus}>{statusText}</Text>
        </View>
        <View style={styles.tempBadge}>
          <Text style={styles.tempValue}>{temperature.toFixed(0)}°C</Text>
          <Text style={styles.tempLabel}>Fermentación</Text>
        </View>
      </View>

      <View style={styles.timelineRow}>
        <View style={styles.timelineDot} />
        <View style={styles.timelineLine} />
        <View style={styles.timelineDot} />
      </View>

      <Text style={styles.brewHint}>Revisa la gravedad y asegúrate de mantener la temperatura controlada.</Text>

      <Animated.View style={[styles.bubbleRow, { transform: [{ translateY: bubbleAnim }] }]}> 
        {[0, 1, 2].map(index => (
          <View
            key={index}
            style={[styles.bubble, { left: 24 + index * 28, width: 10 + index * 4, height: 10 + index * 4 }]}
          />
        ))}
      </Animated.View>
    </View>
  );
};

const RecipeCard = ({ recipe, onPress }: { recipe: Recipe; onPress: () => void }) => {
  return (
    <TouchableOpacity
      style={[styles.recipeCard, createShadow('#000', { width: 0, height: 2 }, 0.08, 10, 6)]}
      onPress={onPress}
    >
      <View style={styles.recipeBadge}>
        <MaterialCommunityIcons name="beer" size={18} color={GOLD} />
        <Text style={styles.recipeStyle}>{recipe.style}</Text>
      </View>
      <Text style={styles.recipeName}>{recipe.name}</Text>
      <View style={styles.recipeStatsRow}>
        <View style={styles.recipeStat}>
          <Text style={styles.recipeStatLabel}>ABV</Text>
          <Text style={styles.recipeStatValue}>{recipe.abv?.toFixed(1) ?? '--'}%</Text>
        </View>
        <View style={styles.recipeStat}>
          <Text style={styles.recipeStatLabel}>IBU</Text>
          <Text style={styles.recipeStatValue}>{recipe.ibu ?? '--'}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  container: {
    padding: 20,
    paddingBottom: 60,
  },
  header: {
    marginBottom: 24,
  },
  subTitle: {
    color: '#6E6E6E',
    fontSize: 14,
  },
  title: {
    color: DEEP_BREW,
    fontSize: 26,
    fontWeight: '700',
    marginTop: 6,
  },
  activeCardContainer: {
    marginBottom: 28,
  },
  brewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 20,
    overflow: 'hidden',
  },
  brewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  brewTitle: {
    color: DEEP_BREW,
    fontSize: 20,
    fontWeight: '700',
  },
  brewStatus: {
    color: GOLD,
    marginTop: 6,
    fontSize: 14,
    fontWeight: '600',
  },
  tempBadge: {
    backgroundColor: '#FFF4CA',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
  },
  tempValue: {
    color: DEEP_BREW,
    fontSize: 16,
    fontWeight: '700',
  },
  tempLabel: {
    color: '#6C6C6C',
    fontSize: 10,
    textTransform: 'uppercase',
    marginTop: 2,
    letterSpacing: 0.5,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    marginBottom: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: GOLD,
  },
  timelineLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#F3E8C4',
  },
  brewHint: {
    color: '#5B5B5B',
    fontSize: 13,
    lineHeight: 20,
  },
  bubbleRow: {
    position: 'absolute',
    bottom: 12,
    left: 0,
    right: 0,
    height: 28,
  },
  bubble: {
    position: 'absolute',
    backgroundColor: 'rgba(129,167,66,0.2)',
    borderRadius: 20,
  },
  emptyBrewCard: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    gap: 12,
  },
  emptyBrewTitle: {
    color: DEEP_BREW,
    fontSize: 18,
    fontWeight: '700',
  },
  emptyBrewSubtitle: {
    color: '#6A6A6A',
    textAlign: 'center',
    lineHeight: 20,
    fontSize: 13,
  },
  inlineActions: {
    flexDirection: 'row',
    gap: 12,
  },
  inlineButton: {
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  inlinePrimary: {
    backgroundColor: GOLD,
  },
  inlinePrimaryText: {
    color: DEEP_BREW,
    fontWeight: '700',
  },
  inlineSecondaryText: {
    color: HOP_GREEN,
    fontWeight: '600',
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    borderRadius: 16,
    paddingVertical: 18,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 10,
  },
  actionPrimary: {
    backgroundColor: GOLD,
  },
  actionSecondary: {
    backgroundColor: HOP_GREEN,
  },
  actionPrimaryText: {
    color: DEEP_BREW,
    fontWeight: '700',
  },
  actionSecondaryText: {
    color: 'white',
    fontWeight: '700',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    color: DEEP_BREW,
    fontSize: 18,
    fontWeight: '700',
  },
  viewAll: {
    color: GOLD,
    fontWeight: '600',
    fontSize: 14,
  },
  recipeScroll: {
    paddingRight: 10,
  },
  recipeCard: {
    width: 180,
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 16,
    marginRight: 16,
  },
  recipeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(246,193,1,0.12)',
    alignSelf: 'flex-start',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  recipeStyle: {
    color: GOLD,
    fontSize: 12,
    fontWeight: '600',
  },
  recipeName: {
    color: DEEP_BREW,
    fontSize: 16,
    fontWeight: '700',
    marginTop: 12,
    marginBottom: 20,
  },
  recipeStatsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.35)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    gap: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: DEEP_BREW,
  },
  modalList: {
    maxHeight: 280,
  },
  modalItem: {
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  modalItemSubtitle: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  modalManual: {
    borderBottomWidth: 0,
    backgroundColor: '#FFF8E7',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  modalEmpty: {
    textAlign: 'center',
    color: '#999',
    paddingVertical: 12,
  },
  modalClose: {
    alignSelf: 'center',
    paddingVertical: 10,
    paddingHorizontal: 24,
    borderRadius: 12,
    backgroundColor: '#EFEFEF',
  },
  modalCloseText: {
    color: '#333',
    fontWeight: '600',
  },
  recipeStat: {
    alignItems: 'flex-start',
  },
  recipeStatLabel: {
    color: '#8A8A8A',
    fontSize: 12,
  },
  recipeStatValue: {
    color: DEEP_BREW,
    fontSize: 14,
    fontWeight: '600',
  },
  noRecipesCard: {
    backgroundColor: 'white',
    borderRadius: 18,
    padding: 18,
    alignItems: 'center',
    marginTop: 12,
  },
  noRecipesText: {
    color: '#7A7A7A',
    fontSize: 14,
  },
  noRecipesAction: {
    color: GOLD,
    fontWeight: '700',
    marginTop: 10,
  },
});
