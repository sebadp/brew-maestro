import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useRecipeStore, { Recipe, Ingredient, calculateABV, calculateMashWater, calculateSpargeWater } from '../../store/recipeStore';
import { BEER_STYLES } from '../../types/beerStyles';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

type EditableIngredient = Partial<Ingredient> & { displayAmount: string };
type EditableMalt = EditableIngredient & { type: 'malt' };
type EditableHop = EditableIngredient & { type: 'hop' };

const parseNumericInput = (value: string | undefined) => {
  if (!value?.trim()) {
    return undefined;
  }

  const normalized = value.replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
};

const DEFAULT_INSTRUCTIONS = [
  'Heat strike water to appropriate temperature',
  'Mash grains for 60 minutes',
  'Sparge and collect wort',
  'Bring wort to boil and add hops according to schedule',
  'Cool wort to pitching temperature',
  'Transfer to fermenter and pitch yeast',
  'Ferment at appropriate temperature',
  'Package when fermentation is complete',
];

const DEFAULT_YEAST: Partial<Ingredient> = {
  name: 'Safale US-05',
  amount: 11.5,
  unit: 'g',
  type: 'yeast',
};

export default function NewRecipeScreen() {
  const router = useRouter();
  const { editId } = useLocalSearchParams<{ editId?: string }>();
  const isEditing = Boolean(editId);
  const { addRecipe, updateRecipe: updateRecipeInStore, getRecipe, isLoading } = useRecipeStore();

  const [recipe, setRecipe] = useState({
    name: '',
    style: BEER_STYLES[0],
    difficulty: 'Custom Craft',
    batchSize: '20',
    mashWater: '12',
    spargeWater: '11',
    boilTime: '60',
    og: '1.050',
    fg: '1.010',
    efficiency: '75',
    notes: '',
  });

  const [malts, setMalts] = useState<EditableMalt[]>([
    { name: 'Pale Malt', amount: 4, displayAmount: '4', unit: 'kg', type: 'malt' },
  ]);

  const [hops, setHops] = useState<EditableHop[]>([
    { name: 'Cascade', amount: 30, displayAmount: '30', unit: 'g', time: 60, alphaAcid: 5.5, type: 'hop' },
  ]);

  const [yeast, setYeast] = useState<Partial<Ingredient>>(() => ({ ...DEFAULT_YEAST }));
  const [otherIngredients, setOtherIngredients] = useState<Ingredient[]>([]);
  const [loadedRecipe, setLoadedRecipe] = useState<Recipe | null>(null);
  const [isInitialized, setIsInitialized] = useState(!isEditing);
  const [isStylePickerVisible, setIsStylePickerVisible] = useState(false);
  const [styleQuery, setStyleQuery] = useState('');
  const [isCustomStyle, setIsCustomStyle] = useState(false);
  const [shouldFocusStyleInput, setShouldFocusStyleInput] = useState(false);
  const styleInputRef = useRef<TextInput | null>(null);

  const filteredStyles = useMemo(() => {
    const query = styleQuery.trim().toLowerCase();
    if (!query) {
      return BEER_STYLES;
    }
    return BEER_STYLES.filter(style => style.toLowerCase().includes(query));
  }, [styleQuery]);

  const hasExactStyleMatch = useMemo(() => {
    const query = styleQuery.trim().toLowerCase();
    return Boolean(query) && BEER_STYLES.some(style => style.toLowerCase() === query);
  }, [styleQuery]);

  useEffect(() => {
    if (!isStylePickerVisible) {
      setStyleQuery('');
    }
  }, [isStylePickerVisible]);

  useEffect(() => {
    if (!isEditing || !editId) {
      return;
    }

    const existingRecipe = getRecipe(editId);
    if (!existingRecipe) {
      Alert.alert('Recipe not found', 'Unable to edit this recipe.', [
        { text: 'OK', onPress: () => router.back() },
      ]);
      setIsInitialized(true);
      return;
    }

    setRecipe({
      name: existingRecipe.name,
      style: existingRecipe.style,
      difficulty: existingRecipe.difficulty ?? 'Custom Craft',
      batchSize: existingRecipe.batchSize.toString(),
      mashWater: existingRecipe.mashWater.toString(),
      spargeWater: existingRecipe.spargeWater.toString(),
      boilTime: existingRecipe.boilTime.toString(),
      og: existingRecipe.og.toFixed(3),
      fg: existingRecipe.fg.toFixed(3),
      efficiency: existingRecipe.efficiency.toString(),
      notes: existingRecipe.notes ?? '',
    });

    setMalts(
      existingRecipe.ingredients
        .filter(ingredient => ingredient.type === 'malt')
        .map<EditableMalt>(ingredient => ({
          ...ingredient,
          displayAmount: ingredient.amount?.toString() ?? '',
          type: 'malt',
        }))
    );

    setHops(
      existingRecipe.ingredients
        .filter(ingredient => ingredient.type === 'hop')
        .map<EditableHop>(ingredient => ({
          ...ingredient,
          displayAmount: ingredient.amount?.toString() ?? '',
          type: 'hop',
        }))
    );

    const existingYeasts = existingRecipe.ingredients.filter(ingredient => ingredient.type === 'yeast');
    setYeast(existingYeasts.length > 0 ? { ...existingYeasts[0] } : { ...DEFAULT_YEAST });

    setOtherIngredients(
      existingRecipe.ingredients
        .filter(ingredient => !['malt', 'hop', 'yeast'].includes(ingredient.type))
        .map(ingredient => ({ ...ingredient }))
    );

    setLoadedRecipe(existingRecipe);
    setIsCustomStyle(!BEER_STYLES.includes(existingRecipe.style));
    setShouldFocusStyleInput(false);
    setIsInitialized(true);
  }, [isEditing, editId, getRecipe, router]);

  useEffect(() => {
    if (isCustomStyle && shouldFocusStyleInput && styleInputRef.current) {
      styleInputRef.current.focus();
      setShouldFocusStyleInput(false);
    }
  }, [isCustomStyle, shouldFocusStyleInput]);

  const updateRecipeField = (field: string, value: string) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const handleSelectStyle = (selectedStyle: string) => {
    updateRecipeField('style', selectedStyle);
    setIsCustomStyle(false);
    setShouldFocusStyleInput(false);
    setIsStylePickerVisible(false);
  };

  const handleUseQueryAsStyle = () => {
    const customStyle = styleQuery.trim();
    if (!customStyle) {
      return;
    }

    updateRecipeField('style', customStyle);
    setIsCustomStyle(!BEER_STYLES.includes(customStyle));
    setShouldFocusStyleInput(false);
    setIsStylePickerVisible(false);
  };

  const handleChooseCustomStyle = () => {
    setIsCustomStyle(true);
    updateRecipeField('style', '');
    setShouldFocusStyleInput(true);
    setIsStylePickerVisible(false);
  };

  const addMalt = () => {
    setMalts(prev => [...prev, { name: '', amount: undefined, displayAmount: '', unit: 'kg', type: 'malt' }]);
  };

  const updateMalt = (index: number, field: 'name' | 'amount', value: string) => {
    setMalts(prev => prev.map((malt, i) => {
      if (i !== index) {
        return malt;
      }

      if (field === 'amount') {
        const numericValue = parseNumericInput(value);
        return { ...malt, amount: numericValue, displayAmount: value };
      }

      return { ...malt, [field]: value };
    }));
  };

  const removeMalt = (index: number) => {
    if (malts.length > 1) {
      setMalts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addHop = () => {
    setHops(prev => [...prev, {
      name: '',
      amount: undefined,
      displayAmount: '',
      unit: 'g',
      time: 15,
      alphaAcid: 5.0,
      type: 'hop'
    }]);
  };

  const updateHop = (index: number, field: 'name' | 'amount' | 'alphaAcid' | 'time', value: string) => {
    setHops(prev => prev.map((hop, i) => {
      if (i !== index) {
        return hop;
      }

      if (field === 'amount') {
        const numericValue = parseNumericInput(value);
        return { ...hop, amount: numericValue, displayAmount: value };
      }

      if (field === 'alphaAcid' || field === 'time') {
        const numericValue = parseNumericInput(value);
        return { ...hop, [field]: numericValue ?? undefined };
      }

      return { ...hop, [field]: value };
    }));
  };

  const removeHop = (index: number) => {
    if (hops.length > 1) {
      setHops(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateRecipeStats = (baseRecipe?: Recipe | null) => {
    const og = parseFloat(recipe.og) || baseRecipe?.og || 1.05;
    const fg = parseFloat(recipe.fg) || baseRecipe?.fg || 1.01;

    return {
      abv: calculateABV(og, fg),
      ibu: baseRecipe?.ibu ?? 30,
      srm: baseRecipe?.srm ?? 8,
    };
  };

  const generateIngredientId = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

  const resolveEditableAmount = (ingredient: EditableIngredient) => {
    if (typeof ingredient.amount === 'number' && !Number.isNaN(ingredient.amount)) {
      return ingredient.amount;
    }

    const parsed = parseNumericInput(ingredient.displayAmount);
    return parsed ?? 0;
  };

  const buildIngredients = (): Ingredient[] => {
    const maltIngredients = malts.map(malt => ({
      id: malt.id ?? generateIngredientId(),
      name: malt.name!.trim(),
      type: malt.type ?? 'malt',
      amount: resolveEditableAmount(malt),
      unit: malt.unit ?? 'kg',
      color: malt.color,
    }));

    const hopIngredients = hops.map(hop => ({
      id: hop.id ?? generateIngredientId(),
      name: hop.name!.trim(),
      type: hop.type ?? 'hop',
      amount: resolveEditableAmount(hop),
      unit: hop.unit ?? 'g',
      time: hop.time,
      alphaAcid: hop.alphaAcid,
    }));

    const yeastIngredient = yeast.name
      ? [{
          id: yeast.id ?? generateIngredientId(),
          name: yeast.name.trim(),
          type: 'yeast' as const,
          amount: typeof yeast.amount === 'number' ? yeast.amount : 0,
          unit: yeast.unit ?? 'g',
        }]
      : [];

    const preservedOthers = otherIngredients.map(ingredient => ({
      ...ingredient,
      id: ingredient.id ?? generateIngredientId(),
    }));

    return [...maltIngredients, ...hopIngredients, ...yeastIngredient, ...preservedOthers];
  };

  const validateAndSave = async () => {
    if (!recipe.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a recipe name.');
      return;
    }

    const trimmedStyle = recipe.style.trim();
    if (!trimmedStyle) {
      Alert.alert('Validation Error', 'Please select or enter a beer style.');
      return;
    }

    if (malts.some(malt => !malt.name?.trim() || parseNumericInput(malt.displayAmount) === undefined)) {
      Alert.alert('Validation Error', 'Please complete all malt entries.');
      return;
    }

    if (hops.some(hop => !hop.name?.trim() || parseNumericInput(hop.displayAmount) === undefined)) {
      Alert.alert('Validation Error', 'Please complete all hop entries.');
      return;
    }

    if (!yeast.name?.trim()) {
      Alert.alert('Validation Error', 'Please enter yeast information.');
      return;
    }

    const stats = calculateRecipeStats(loadedRecipe);
    const ingredients = buildIngredients();
    const batchSize = parseFloat(recipe.batchSize) || loadedRecipe?.batchSize || 20;
    const mashWater = parseFloat(recipe.mashWater) || loadedRecipe?.mashWater || 12;
    const spargeWater = parseFloat(recipe.spargeWater) || loadedRecipe?.spargeWater || 11;
    const boilTime = parseFloat(recipe.boilTime) || loadedRecipe?.boilTime || 60;
    const og = parseFloat(recipe.og) || loadedRecipe?.og || 1.05;
    const fg = parseFloat(recipe.fg) || loadedRecipe?.fg || 1.01;
    const efficiency = parseFloat(recipe.efficiency) || loadedRecipe?.efficiency || 75;
    const instructions = loadedRecipe?.instructions ?? DEFAULT_INSTRUCTIONS;

    if (isEditing && editId) {
      try {
        await updateRecipeInStore(editId, {
          name: recipe.name.trim(),
          style: trimmedStyle,
          difficulty: recipe.difficulty,
          batchSize,
          mashWater,
          spargeWater,
          boilTime,
          og,
          fg,
          abv: stats.abv,
          ibu: loadedRecipe?.ibu ?? stats.ibu,
          srm: loadedRecipe?.srm ?? stats.srm,
          efficiency,
          ingredients,
          instructions,
          notes: recipe.notes,
        });

        Alert.alert('Success', 'Recipe updated successfully!', [
          { text: 'OK', onPress: () => router.replace(`/recipe/${editId}`) }
        ]);
      } catch (error) {
        Alert.alert('Error', 'Failed to update recipe. Please try again.');
      }

      return;
    }

    const newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
      name: recipe.name.trim(),
      style: trimmedStyle,
      difficulty: recipe.difficulty,
      batchSize,
      mashWater,
      spargeWater,
      boilTime,
      og,
      fg,
      abv: stats.abv,
      ibu: stats.ibu,
      srm: stats.srm,
      efficiency,
      ingredients,
      instructions,
      notes: recipe.notes,
    };

    try {
      await addRecipe(newRecipe);
      Alert.alert('Success', 'Recipe saved successfully!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (error) {
      Alert.alert('Error', 'Failed to save recipe. Please try again.');
    }
  };

  if (isEditing && !isInitialized) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading recipe...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (isEditing && isInitialized && !loadedRecipe) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Recipe not found.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>{isEditing ? 'Edit Recipe' : 'New Recipe'}</Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipe Name</Text>
            <TextInput
              style={styles.input}
              value={recipe.name}
              onChangeText={(value) => updateRecipeField('name', value)}
              placeholder="Enter recipe name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Style</Text>
            <TouchableOpacity
              style={styles.styleSelector}
              onPress={() => setIsStylePickerVisible(true)}
              accessibilityRole="button"
            >
              <Text style={recipe.style ? styles.styleSelectorText : styles.styleSelectorPlaceholder}>
                {recipe.style || (isCustomStyle ? 'Ingresa un estilo personalizado' : 'Selecciona un estilo popular')}
              </Text>
              <MaterialCommunityIcons name="chevron-down" size={20} color={DEEP_BREW} />
            </TouchableOpacity>
            {isCustomStyle && (
              <TextInput
                ref={styleInputRef}
                style={[styles.input, styles.styleTextInput]}
                value={recipe.style}
                onChangeText={(value) => updateRecipeField('style', value)}
                placeholder="Escribe un nuevo estilo"
                autoCapitalize="words"
              />
            )}
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Batch Size (L)</Text>
              <TextInput
                style={styles.input}
                value={recipe.batchSize}
                onChangeText={(value) => updateRecipeField('batchSize', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Boil Time (min)</Text>
              <TextInput
                style={styles.input}
                value={recipe.boilTime}
                onChangeText={(value) => updateRecipeField('boilTime', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Mash Water (L)</Text>
              <TextInput
                style={styles.input}
                value={recipe.mashWater}
                onChangeText={(value) => updateRecipeField('mashWater', value)}
                keyboardType="decimal-pad"
                placeholder="12.0"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Sparge Water (L)</Text>
              <TextInput
                style={styles.input}
                value={recipe.spargeWater}
                onChangeText={(value) => updateRecipeField('spargeWater', value)}
                keyboardType="decimal-pad"
                placeholder="11.0"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Target OG</Text>
              <TextInput
                style={styles.input}
                value={recipe.og}
                onChangeText={(value) => updateRecipeField('og', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Target FG</Text>
              <TextInput
                style={styles.input}
                value={recipe.fg}
                onChangeText={(value) => updateRecipeField('fg', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>
        </View>

        {/* Malts */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Fermentables</Text>
            <TouchableOpacity style={styles.addButton} onPress={addMalt}>
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {malts.map((malt, index) => (
            <View key={index} style={styles.ingredientRow}>
              <View style={styles.ingredientInputs}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={malt.name}
                  onChangeText={(value) => updateMalt(index, 'name', value)}
                  placeholder="Malt name"
                />
                <TextInput
                  style={[styles.input, styles.amountInput]}
                  value={malt.displayAmount}
                  onChangeText={(value) => updateMalt(index, 'amount', value)}
                  placeholder="Amount"
                  keyboardType="decimal-pad"
                />
                <Text style={styles.unitText}>kg</Text>
              </View>
              {malts.length > 1 && (
                <TouchableOpacity onPress={() => removeMalt(index)}>
                  <MaterialCommunityIcons name="close" size={20} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Hops */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Hops</Text>
            <TouchableOpacity style={styles.addButton} onPress={addHop}>
              <MaterialCommunityIcons name="plus" size={20} color="white" />
            </TouchableOpacity>
          </View>

          {hops.map((hop, index) => (
            <View key={index} style={styles.hopRow}>
              <View style={styles.hopInputs}>
                <TextInput
                  style={[styles.input, styles.nameInput]}
                  value={hop.name}
                  onChangeText={(value) => updateHop(index, 'name', value)}
                  placeholder="Hop variety"
                />
                <View style={styles.hopDetails}>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={hop.displayAmount}
                    onChangeText={(value) => updateHop(index, 'amount', value)}
                    placeholder="Amount"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>g</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={hop.alphaAcid !== undefined ? hop.alphaAcid.toString() : ''}
                    onChangeText={(value) => updateHop(index, 'alphaAcid', value)}
                    placeholder="AA%"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>AA</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={hop.time !== undefined ? hop.time.toString() : ''}
                    onChangeText={(value) => updateHop(index, 'time', value)}
                    placeholder="Time"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>min</Text>
                </View>
              </View>
              {hops.length > 1 && (
                <TouchableOpacity onPress={() => removeHop(index)}>
                  <MaterialCommunityIcons name="close" size={20} color="#E74C3C" />
                </TouchableOpacity>
              )}
            </View>
          ))}
        </View>

        {/* Yeast */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Yeast</Text>
          <View style={styles.ingredientRow}>
            <View style={styles.ingredientInputs}>
              <TextInput
                style={[styles.input, styles.nameInput]}
                value={yeast.name}
                onChangeText={(value) => setYeast(prev => ({ ...prev, name: value }))}
                placeholder="Yeast strain"
              />
              <TextInput
                style={[styles.input, styles.amountInput]}
                value={yeast.amount?.toString()}
                onChangeText={(value) => setYeast(prev => ({ ...prev, amount: parseFloat(value) || 0 }))}
                placeholder="Amount"
                keyboardType="decimal-pad"
              />
              <Text style={styles.unitText}>g</Text>
            </View>
          </View>
        </View>

        {/* Notes */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Notes</Text>
          <TextInput
            style={[styles.input, styles.notesInput]}
            value={recipe.notes}
            onChangeText={(value) => updateRecipeField('notes', value)}
            placeholder="Recipe notes, brewing tips, etc."
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity
          style={[styles.saveButton, isLoading && styles.saveButtonDisabled]}
          onPress={validateAndSave}
          disabled={isLoading}
        >
          <Text style={styles.saveButtonText}>
            {isLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
      <Modal
        visible={isStylePickerVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setIsStylePickerVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContainer}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Selecciona un estilo</Text>
              <TouchableOpacity
                onPress={() => setIsStylePickerVisible(false)}
                accessibilityRole="button"
                style={styles.modalCloseButton}
              >
                <MaterialCommunityIcons name="close" size={22} color={DEEP_BREW} />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[styles.input, styles.modalSearchInput]}
              value={styleQuery}
              onChangeText={setStyleQuery}
              placeholder="Buscar estilos"
              autoFocus
            />
            <ScrollView style={styles.modalList} keyboardShouldPersistTaps="handled">
              {filteredStyles.map(style => (
                <TouchableOpacity
                  key={style}
                  style={styles.modalOption}
                  onPress={() => handleSelectStyle(style)}
                  accessibilityRole="button"
                >
                  <Text style={styles.modalOptionText}>{style}</Text>
                  {recipe.style === style && (
                    <MaterialCommunityIcons name="check" size={20} color={HOP_GREEN} />
                  )}
                </TouchableOpacity>
              ))}
              {filteredStyles.length === 0 && (
                <Text style={styles.modalEmptyText}>No encontramos estilos con ese nombre.</Text>
              )}
            </ScrollView>
            {styleQuery.trim().length > 0 && !hasExactStyleMatch && (
              <TouchableOpacity
                style={styles.modalCustomButton}
                onPress={handleUseQueryAsStyle}
                accessibilityRole="button"
              >
                <Text style={styles.modalCustomButtonText}>
                  {`Usar "${styleQuery.trim()}"`}
                </Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              style={styles.modalOtherButton}
              onPress={handleChooseCustomStyle}
              accessibilityRole="button"
            >
              <MaterialCommunityIcons name="pencil" size={18} color={HOP_GREEN} style={styles.modalOtherIcon} />
              <Text style={styles.modalOtherText}>Otro estilo…</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  loadingText: {
    fontSize: 16,
    color: '#666',
  },
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
    marginBottom: 24,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  addButton: {
    backgroundColor: HOP_GREEN,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputGroup: {
    marginBottom: 16,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: DEEP_BREW,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    fontSize: 16,
    backgroundColor: 'white',
  },
  styleSelector: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  styleSelectorText: {
    fontSize: 16,
    color: DEEP_BREW,
    flex: 1,
    marginRight: 12,
  },
  styleSelectorPlaceholder: {
    fontSize: 16,
    color: '#999',
    flex: 1,
    marginRight: 12,
  },
  styleTextInput: {
    marginTop: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  halfWidth: {
    flex: 1,
  },
  ingredientRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
    gap: 12,
  },
  ingredientInputs: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  nameInput: {
    flex: 2,
  },
  amountInput: {
    flex: 1,
  },
  unitText: {
    fontSize: 14,
    color: '#666',
    minWidth: 20,
  },
  hopRow: {
    marginBottom: 16,
  },
  hopInputs: {
    flex: 1,
  },
  hopDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 8,
  },
  smallInput: {
    flex: 1,
    minWidth: 60,
  },
  notesInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  saveButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonDisabled: {
    opacity: 0.6,
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  modalContainer: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  modalCloseButton: {
    padding: 4,
  },
  modalSearchInput: {
    marginBottom: 12,
  },
  modalList: {
    maxHeight: 260,
    marginBottom: 8,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F2F2F2',
  },
  modalOptionText: {
    fontSize: 16,
    color: DEEP_BREW,
    flex: 1,
    marginRight: 12,
  },
  modalEmptyText: {
    textAlign: 'center',
    color: '#666',
    paddingVertical: 24,
    fontSize: 14,
  },
  modalCustomButton: {
    marginTop: 16,
    backgroundColor: HOP_GREEN,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalCustomButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  modalOtherButton: {
    marginTop: 12,
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
  },
  modalOtherIcon: {
    marginRight: 8,
  },
  modalOtherText: {
    color: HOP_GREEN,
    fontWeight: '600',
    fontSize: 15,
  },
});
