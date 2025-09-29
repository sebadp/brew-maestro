import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  ActivityIndicator,
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import ActiveFermentationCard from '../../components/dashboard/ActiveFermentationCard';
import { BrewRecord, useBrewTrackerStore } from '../../store/brewTrackerStore';
import useRecipeStore, { Recipe } from '../../store/recipeStore';
import { isSQLiteAvailable } from '../../database/brewDb';
import useBrewSessionStore from '../../store/brewSessionStore';
import { exportUserData, importUserData } from '../../utils/exportData';

type PromptType = 'startFermentation' | 'startConditioning' | 'addNote';

interface PromptState {
  visible: boolean;
  type: PromptType;
  brew: BrewRecord | null;
}

const MS_IN_DAY = 1000 * 60 * 60 * 24;

const getElapsedDays = (start?: string | null) => {
  if (!start) return null;
  const date = new Date(start);
  if (Number.isNaN(date.getTime())) return null;
  const diff = Date.now() - date.getTime();
  if (diff <= 0) return 0;
  return Math.floor(diff / MS_IN_DAY);
};

const BrewsScreen: React.FC = () => {
  const router = useRouter();
  const {
    activeBrews,
    archivedBrews,
    isLoading,
    loadBrews,
    startFermentation,
    startConditioning,
    addQuickNote,
    completeBrew,
  } = useBrewTrackerStore(state => ({
    activeBrews: state.activeBrews,
    archivedBrews: state.archivedBrews,
    isLoading: state.isLoading,
    loadBrews: state.loadBrews,
    startFermentation: state.startFermentation,
    startConditioning: state.startConditioning,
    addQuickNote: state.addQuickNote,
    completeBrew: state.completeBrew,
  }));

  const { recipes, loadRecipes, getRecipe } = useRecipeStore(state => ({
    recipes: state.recipes,
    loadRecipes: state.loadRecipes,
    getRecipe: state.getRecipe,
  }));

  const { startSession } = useBrewSessionStore(state => ({
    startSession: state.startSession,
  }));

  const [prompt, setPrompt] = useState<PromptState>({ visible: false, type: 'startFermentation', brew: null });
  const [fermentationOg, setFermentationOg] = useState('1.050');
  const [fermentationTemp, setFermentationTemp] = useState('18');
  const [fermentationTargetDays, setFermentationTargetDays] = useState('14');
  const [conditioningFg, setConditioningFg] = useState('1.010');
  const [conditioningTargetDays, setConditioningTargetDays] = useState('14');
  const [noteText, setNoteText] = useState('');
  const [chooseRecipeVisible, setChooseRecipeVisible] = useState(false);
  const [exportingData, setExportingData] = useState(false);
  const [importModalVisible, setImportModalVisible] = useState(false);
  const [importText, setImportText] = useState('');
  const [importingData, setImportingData] = useState(false);
  const [detailBrew, setDetailBrew] = useState<BrewRecord | null>(null);

  useFocusEffect(
    useCallback(() => {
      if (isSQLiteAvailable) {
        loadBrews();
      }
    }, [loadBrews])
  );

  useEffect(() => {
    if (recipes.length === 0) {
      loadRecipes();
    }
  }, [recipes.length, loadRecipes]);

  const currentlyBrewing = useMemo(() => activeBrews.filter(b => b.status === 'brewing'), [activeBrews]);
  const fermenting = useMemo(() => activeBrews.filter(b => b.status === 'fermenting'), [activeBrews]);
  const conditioning = useMemo(() => activeBrews.filter(b => b.status === 'conditioning'), [activeBrews]);
  const fermentationElapsedDays = getElapsedDays(prompt.brew?.fermentationStart);

  const handlePromptClose = () => {
    setPrompt(prev => ({ ...prev, visible: false, brew: null }));
    setFermentationOg('1.050');
    setFermentationTemp('18');
    setFermentationTargetDays('14');
    setConditioningFg('1.010');
    setConditioningTargetDays('14');
    setNoteText('');
  };

  const handleCreateBrew = async (recipeId: string) => {
    const recipe = getRecipe(recipeId);
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
  };

  const handleExportData = async () => {
    try {
      setExportingData(true);
      const backup = await exportUserData();
      await Share.share({
        title: 'Backup BrewMaestro',
        message: backup,
      });
    } catch (error) {
      Alert.alert('Error', 'No se pudo exportar tus datos. Intenta nuevamente.');
    } finally {
      setExportingData(false);
    }
  };

  const handleImportData = async () => {
    if (!importText.trim()) {
      Alert.alert('Sin datos', 'Pega el contenido JSON exportado para restaurar tus datos.');
      return;
    }

    try {
      setImportingData(true);
      const result = await importUserData(importText.trim());
      await Promise.all([loadRecipes(), loadBrews()]);
      setImportModalVisible(false);
      setImportText('');

      const messageLines = [
        `Recetas restauradas: ${result.recipes}`,
        `Brews restaurados: ${result.brews}`,
      ];
      if (result.warnings.length > 0) {
        messageLines.push('', ...result.warnings);
      }

      Alert.alert('Datos restaurados', messageLines.join('\n'));
    } catch (error: any) {
      Alert.alert('Error al importar', error?.message ?? 'Verifica el contenido e intenta nuevamente.');
    } finally {
      setImportingData(false);
    }
  };

  const openPrompt = (brew: BrewRecord, type: PromptType) => {
    if (type === 'startFermentation') {
      setFermentationOg(brew.originalGravity ? brew.originalGravity.toFixed(3) : '1.050');
      setFermentationTemp(brew.fermentationTemp ? String(brew.fermentationTemp) : '18');
      setFermentationTargetDays(String(brew.targetFermentationDays ?? 14));
    }

    if (type === 'startConditioning') {
      setConditioningFg(brew.finalGravity ? brew.finalGravity.toFixed(3) : '1.010');
      setConditioningTargetDays(String(brew.targetConditioningDays ?? 14));
    }

    setPrompt({ brew, type, visible: true });
  };

  const handleConfirmPrompt = async () => {
    if (!prompt.brew) return;

    try {
      if (prompt.type === 'startFermentation') {
        const og = parseFloat(fermentationOg);
        const temp = fermentationTemp ? parseFloat(fermentationTemp) : undefined;
        const targetDaysRaw = fermentationTargetDays.trim();
        const targetDays = targetDaysRaw ? parseInt(targetDaysRaw, 10) : undefined;

        if (Number.isNaN(og) || og < 1) {
          Alert.alert('Dato inválido', 'Introduce una gravedad original válida.');
          return;
        }

        if (targetDays !== undefined && (Number.isNaN(targetDays) || targetDays <= 0)) {
          Alert.alert('Dato inválido', 'Introduce una duración objetivo mayor a 0.');
          return;
        }

        const normalizedFermentationTarget = targetDays !== undefined && !Number.isNaN(targetDays)
          ? targetDays
          : undefined;

        await startFermentation(prompt.brew.id, og, temp, normalizedFermentationTarget);
      }

      if (prompt.type === 'startConditioning') {
        const fg = parseFloat(conditioningFg);
        const targetDaysRaw = conditioningTargetDays.trim();
        const targetDays = targetDaysRaw ? parseInt(targetDaysRaw, 10) : undefined;
        if (Number.isNaN(fg) || fg < 0.9) {
          Alert.alert('Dato inválido', 'Introduce una gravedad final válida.');
          return;
        }

        if (targetDays !== undefined && (Number.isNaN(targetDays) || targetDays <= 0)) {
          Alert.alert('Dato inválido', 'Introduce una duración objetivo mayor a 0.');
          return;
        }
        const normalizedConditioningTarget = targetDays !== undefined && !Number.isNaN(targetDays)
          ? targetDays
          : undefined;

        await startConditioning(prompt.brew.id, fg, normalizedConditioningTarget);
      }

      if (prompt.type === 'addNote') {
        if (!noteText.trim()) {
          Alert.alert('Nota vacía', 'Escribe algo para guardar la nota.');
          return;
        }
        await addQuickNote(prompt.brew.id, noteText.trim());
      }
    } catch (error) {
      Alert.alert('Error', 'Algo salió mal. Intenta de nuevo.');
    } finally {
      handlePromptClose();
    }
  };

  const handleCompleteBrew = (brew: BrewRecord) => {
    Alert.alert(
      'Finalizar lote',
      `¿Confirmas que ${brew.recipeName} está listo?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Sí, completar',
          style: 'default',
          onPress: async () => {
            try {
              await completeBrew(brew.id);
            } catch (error) {
              Alert.alert('Error', 'No se pudo completar el lote.');
            }
          },
        },
      ]
    );
  };

  const handleCardPress = (brew: BrewRecord) => {
    if (brew.status === 'brewing') {
      Alert.alert(
        'Cocción activa',
        'Cuando enfríes y equipes el fermentador, registra la gravedad OG para pasar a fermentación.',
        [
          { text: 'Cancelar', style: 'cancel' },
          { text: 'Iniciar fermentación', onPress: () => openPrompt(brew, 'startFermentation') },
        ]
      );
      return;
    }

    if (brew.status === 'fermenting') {
      Alert.alert(
        'Fermentando',
        'Puedes añadir notas o pasar a maduración.',
        [
          { text: 'Añadir nota', onPress: () => openPrompt(brew, 'addNote') },
          { text: 'Pasar a maduración', onPress: () => openPrompt(brew, 'startConditioning') },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }

    if (brew.status === 'conditioning') {
      Alert.alert(
        'Madurando',
        '¿Quieres añadir una nota o marcar como completado?',
        [
          { text: 'Añadir nota', onPress: () => openPrompt(brew, 'addNote') },
          { text: 'Marcar completado', onPress: () => handleCompleteBrew(brew) },
          { text: 'Cancelar', style: 'cancel' },
        ]
      );
      return;
    }
  };

  if (!isSQLiteAvailable) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.warningContainer}>
          <Text style={styles.warningTitle}>Seguimiento disponible solo en móvil</Text>
          <Text style={styles.warningBody}>
            El tracking de fermentación usa SQLite y notificaciones locales.
            Ábrelo en Expo Go o en una build nativa para acceder a tus brews activos.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <Text style={styles.title}>Tus Brews</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={[styles.importButton, importingData && styles.exportButtonDisabled]}
              onPress={() => setImportModalVisible(true)}
              disabled={importingData}
            >
              <MaterialCommunityIcons name="tray-arrow-up" size={18} color="#1A1A1A" />
              <Text style={styles.exportText}>Importar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.exportButton, exportingData && styles.exportButtonDisabled]}
              onPress={handleExportData}
              disabled={exportingData}
            >
              <MaterialCommunityIcons name="tray-arrow-down" size={18} color="#1A1A1A" />
              <Text style={styles.exportText}>{exportingData ? 'Exportando…' : 'Exportar'}</Text>
            </TouchableOpacity>
          </View>
        </View>
        <Text style={styles.subtitle}>
          {activeBrews.length > 0
            ? `Gestiona ${activeBrews.length} lote${activeBrews.length === 1 ? '' : 's'} en progreso.`
            : 'Aún no tienes brews activos. ¡Comienza uno nuevo!'}
        </Text>
      </View>

        <Pressable style={styles.primaryButton} onPress={() => setChooseRecipeVisible(true)}>
          <Text style={styles.primaryButtonText}>Nueva Cocción</Text>
        </Pressable>

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator color="#F6C101" />
          </View>
        )}

        {currentlyBrewing.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🔥 Elaborando</Text>
            {currentlyBrewing.map(brew => (
              <ActiveFermentationCard
                key={brew.id}
                brew={brew}
                onPress={handleCardPress}
              />
            ))}
          </View>
        )}

        {fermenting.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🫧 Fermentando</Text>
            {fermenting.map(brew => (
              <ActiveFermentationCard
                key={brew.id}
                brew={brew}
                onPress={handleCardPress}
              />
            ))}
          </View>
        )}

        {conditioning.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>🍾 Madurando</Text>
            {conditioning.map(brew => (
              <ActiveFermentationCard
                key={brew.id}
                brew={brew}
                onPress={handleCardPress}
              />
            ))}
          </View>
        )}

        {archivedBrews.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>✅ Listas</Text>
            {archivedBrews.slice(0, 3).map(brew => (
              <View key={brew.id} style={styles.completedCard}>
                <Text style={styles.completedLabel}>Receta base</Text>
                <Text style={styles.completedTitle}>{brew.recipeName}</Text>
                <Text style={styles.completedSubtitle}>
                  Finalizada el {brew.packagingDate ? new Date(brew.packagingDate).toLocaleDateString() : '—'}
                </Text>
              </View>
            ))}
            {archivedBrews.length > 3 && (
              <Text style={styles.completedHint}>Ver más brews en la sección Brews.</Text>
            )}
          </View>
        )}
      </ScrollView>

      <Modal visible={prompt.visible} transparent animationType="slide">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>
              {prompt.type === 'startFermentation' && 'Registrar gravedad inicial'}
              {prompt.type === 'startConditioning' && 'Registrar gravedad final'}
              {prompt.type === 'addNote' && 'Agregar nota rápida'}
            </Text>

            {prompt.type === 'startFermentation' && (
              <>
                <Text style={styles.modalLabel}>OG medida</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={fermentationOg}
                  onChangeText={setFermentationOg}
                  placeholder="1.050"
                />
                <Text style={styles.modalLabel}>Temperatura (°C)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={fermentationTemp}
                  onChangeText={setFermentationTemp}
                  placeholder="18"
                />
                <Text style={styles.modalLabel}>Duración objetivo (días)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="number-pad"
                  value={fermentationTargetDays}
                  onChangeText={setFermentationTargetDays}
                  placeholder={String(prompt.brew?.targetFermentationDays ?? 14)}
                />
              </>
            )}

            {prompt.type === 'startConditioning' && (
              <>
                <Text style={styles.modalLabel}>FG medida</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="decimal-pad"
                  value={conditioningFg}
                  onChangeText={setConditioningFg}
                  placeholder="1.010"
                />
                <Text style={styles.modalLabel}>Duración objetivo (días)</Text>
                <TextInput
                  style={styles.modalInput}
                  keyboardType="number-pad"
                  value={conditioningTargetDays}
                  onChangeText={setConditioningTargetDays}
                  placeholder={String(prompt.brew?.targetConditioningDays ?? 14)}
                />
                {fermentationElapsedDays !== null && (
                  <Text style={styles.modalHelper}>
                    Fermentación actual: {fermentationElapsedDays} día(s)
                  </Text>
                )}
              </>
            )}

            {prompt.type === 'addNote' && (
              <>
                <Text style={styles.modalLabel}>Nota</Text>
                <TextInput
                  style={[styles.modalInput, styles.modalTextarea]}
                  value={noteText}
                  onChangeText={setNoteText}
                  placeholder="Notas sobre el fermentador, aromas, etc."
                  multiline
                  numberOfLines={4}
                />
              </>
            )}

            <View style={styles.modalActions}>
              <Pressable style={styles.modalSecondary} onPress={handlePromptClose}>
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </Pressable>
              <Pressable style={styles.modalPrimary} onPress={handleConfirmPrompt}>
                <Text style={styles.modalPrimaryText}>Guardar</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      <Modal
        visible={chooseRecipeVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setChooseRecipeVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Selecciona una receta</Text>

            {recipes.length === 0 ? (
              <>
                <Text style={styles.emptyRecipes}>Aún no hay recetas guardadas.</Text>
                <Pressable
                  style={[styles.recipeButton, styles.manualButton]}
                  onPress={() => {
                    setChooseRecipeVisible(false);
                    router.push('/recipe/new');
                  }}
                >
                  <Text style={styles.recipeName}>Crear primera receta</Text>
                  <Text style={styles.recipeDetails}>Te llevamos al creador de recetas</Text>
                </Pressable>
              </>
            ) : (
              <ScrollView style={styles.recipeList}>
                {recipes.map((recipe: Recipe) => (
                  <Pressable
                    key={recipe.id}
                    style={styles.recipeButton}
                    onPress={() => handleCreateBrew(recipe.id)}
                  >
                    <Text style={styles.recipeName}>{recipe.name}</Text>
                    <Text style={styles.recipeDetails}>{recipe.style}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            )}

            <Pressable style={styles.modalSecondary} onPress={() => setChooseRecipeVisible(false)}>
              <Text style={styles.modalSecondaryText}>Cerrar</Text>
            </Pressable>
          </View>
        </View>
      </Modal>

      <Modal visible={importModalVisible} transparent animationType="fade">
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Importar datos</Text>
            <Text style={styles.modalDescription}>
              Pega el contenido del backup exportado. Se sobrescribirán tus recetas y brews actuales.
            </Text>
            <TextInput
              style={[styles.modalInput, styles.modalTextarea]}
              multiline
              numberOfLines={8}
              value={importText}
              onChangeText={setImportText}
              placeholder="Pega aquí el JSON de respaldo"
              autoCapitalize="none"
              autoCorrect={false}
            />
            <View style={styles.modalActions}>
              <TouchableOpacity
                style={styles.modalSecondary}
                onPress={() => {
                  setImportModalVisible(false);
                  setImportText('');
                }}
              >
                <Text style={styles.modalSecondaryText}>Cancelar</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalPrimary, importingData && styles.exportButtonDisabled]}
                onPress={handleImportData}
                disabled={importingData}
              >
                <Text style={styles.modalPrimaryText}>{importingData ? 'Importando…' : 'Importar'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFF8E7',
  },
  container: {
    padding: 20,
    paddingBottom: 32,
  },
  header: {
    marginBottom: 20,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1A1A1A',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  subtitle: {
    fontSize: 16,
    color: '#6B6B6B',
    marginTop: 8,
  },
  warningContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  warningTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    textAlign: 'center',
    marginBottom: 12,
  },
  warningBody: {
    fontSize: 16,
    color: '#6B6B6B',
    textAlign: 'center',
    lineHeight: 22,
  },
  primaryButton: {
    backgroundColor: '#F6C101',
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: 'center',
    marginBottom: 20,
  },
  exportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
  },
  importButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#FFF4CA',
    borderRadius: 14,
  },
  exportButtonDisabled: {
    opacity: 0.6,
  },
  exportText: {
    color: '#1A1A1A',
    fontWeight: '600',
    fontSize: 13,
  },
  primaryButtonText: {
    color: '#1A1A1A',
    fontWeight: '700',
    fontSize: 16,
  },
  loadingContainer: {
    paddingVertical: 12,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#6B4423',
    marginBottom: 12,
  },
  completedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  completedLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#6B6B6B',
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  completedTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  completedSubtitle: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 4,
  },
  completedHint: {
    fontSize: 12,
    color: '#8B8B8B',
  },
  modalContainer: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.25)',
    justifyContent: 'center',
    paddingHorizontal: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1A1A1A',
    marginBottom: 12,
  },
  modalDescription: {
    fontSize: 14,
    color: '#6B6B6B',
    lineHeight: 20,
    marginBottom: 12,
  },
  modalLabel: {
    fontSize: 14,
    color: '#6B6B6B',
    marginTop: 12,
  },
  modalHelper: {
    fontSize: 12,
    color: '#999999',
    marginTop: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    padding: 12,
    marginTop: 8,
    fontSize: 16,
    backgroundColor: '#FAFAFA',
  },
  modalTextarea: {
    minHeight: 100,
    textAlignVertical: 'top',
  },
  modalActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  modalPrimary: {
    backgroundColor: '#81A742',
    borderRadius: 12,
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalPrimaryText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  modalSecondary: {
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  modalSecondaryText: {
    color: '#6B6B6B',
    fontWeight: '600',
  },
  recipeList: {
    maxHeight: 280,
    marginBottom: 12,
  },
  recipeButton: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    backgroundColor: '#FAFAFA',
  },
  manualButton: {
    backgroundColor: '#FFF3CF',
  },
  recipeName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1A1A1A',
  },
  recipeDetails: {
    fontSize: 13,
    color: '#6B6B6B',
    marginTop: 4,
  },
  emptyRecipes: {
    fontSize: 14,
    color: '#6B6B6B',
    textAlign: 'center',
    marginTop: 12,
  },
});

export default BrewsScreen;
