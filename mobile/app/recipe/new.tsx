import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  ScrollView,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import useRecipeStore, { Recipe, Ingredient, calculateABV } from '../../store/recipeStore';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

const BEER_STYLES = [
  'American IPA',
  'Pale Ale',
  'Wheat Beer',
  'Porter',
  'Stout',
  'Lager',
  'Pilsner',
  'Belgian Ale',
  'Saison',
  'Brown Ale',
];

export default function NewRecipeScreen() {
  const router = useRouter();
  const { addRecipe, isLoading } = useRecipeStore();

  const [recipe, setRecipe] = useState({
    name: '',
    style: BEER_STYLES[0],
    batchSize: '20',
    boilTime: '60',
    og: '1.050',
    fg: '1.010',
    efficiency: '75',
    notes: '',
  });

  const [malts, setMalts] = useState<Partial<Ingredient>[]>([
    { name: 'Pale Malt', amount: 4, unit: 'kg', type: 'malt' },
  ]);

  const [hops, setHops] = useState<Partial<Ingredient>[]>([
    { name: 'Cascade', amount: 30, unit: 'g', time: 60, alphaAcid: 5.5, type: 'hop' },
  ]);

  const [yeast, setYeast] = useState<Partial<Ingredient>>({
    name: 'Safale US-05',
    amount: 11.5,
    unit: 'g',
    type: 'yeast',
  });

  const updateRecipe = (field: string, value: string) => {
    setRecipe(prev => ({ ...prev, [field]: value }));
  };

  const addMalt = () => {
    setMalts(prev => [...prev, { name: '', amount: 0, unit: 'kg', type: 'malt' }]);
  };

  const updateMalt = (index: number, field: string, value: string | number) => {
    setMalts(prev => prev.map((malt, i) =>
      i === index ? { ...malt, [field]: value } : malt
    ));
  };

  const removeMalt = (index: number) => {
    if (malts.length > 1) {
      setMalts(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addHop = () => {
    setHops(prev => [...prev, {
      name: '',
      amount: 0,
      unit: 'g',
      time: 15,
      alphaAcid: 5.0,
      type: 'hop'
    }]);
  };

  const updateHop = (index: number, field: string, value: string | number) => {
    setHops(prev => prev.map((hop, i) =>
      i === index ? { ...hop, [field]: value } : hop
    ));
  };

  const removeHop = (index: number) => {
    if (hops.length > 1) {
      setHops(prev => prev.filter((_, i) => i !== index));
    }
  };

  const calculateRecipeStats = () => {
    const og = parseFloat(recipe.og) || 1.050;
    const fg = parseFloat(recipe.fg) || 1.010;
    return {
      abv: calculateABV(og, fg),
      ibu: 30, // Simplified - would need proper IBU calculation
      srm: 8,  // Simplified - would need SRM calculation
    };
  };

  const validateAndSave = async () => {
    if (!recipe.name.trim()) {
      Alert.alert('Validation Error', 'Please enter a recipe name.');
      return;
    }

    if (malts.some(malt => !malt.name || !malt.amount)) {
      Alert.alert('Validation Error', 'Please complete all malt entries.');
      return;
    }

    if (hops.some(hop => !hop.name || !hop.amount)) {
      Alert.alert('Validation Error', 'Please complete all hop entries.');
      return;
    }

    if (!yeast.name) {
      Alert.alert('Validation Error', 'Please enter yeast information.');
      return;
    }

    const stats = calculateRecipeStats();
    const ingredients: Ingredient[] = [
      ...malts.map(malt => ({ ...malt, id: Date.now().toString() + Math.random() } as Ingredient)),
      ...hops.map(hop => ({ ...hop, id: Date.now().toString() + Math.random() } as Ingredient)),
      { ...yeast, id: Date.now().toString() + Math.random() } as Ingredient,
    ];

    const newRecipe: Omit<Recipe, 'id' | 'createdAt' | 'updatedAt'> = {
      name: recipe.name,
      style: recipe.style,
      batchSize: parseFloat(recipe.batchSize) || 20,
      boilTime: parseFloat(recipe.boilTime) || 60,
      og: parseFloat(recipe.og) || 1.050,
      fg: parseFloat(recipe.fg) || 1.010,
      abv: stats.abv,
      ibu: stats.ibu,
      srm: stats.srm,
      efficiency: parseFloat(recipe.efficiency) || 75,
      ingredients,
      instructions: [
        'Heat strike water to appropriate temperature',
        'Mash grains for 60 minutes',
        'Sparge and collect wort',
        'Bring wort to boil and add hops according to schedule',
        'Cool wort to pitching temperature',
        'Transfer to fermenter and pitch yeast',
        'Ferment at appropriate temperature',
        'Package when fermentation is complete',
      ],
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

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>New Recipe</Text>

        {/* Basic Info */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Basic Information</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Recipe Name</Text>
            <TextInput
              style={styles.input}
              value={recipe.name}
              onChangeText={(value) => updateRecipe('name', value)}
              placeholder="Enter recipe name"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Style</Text>
            <View style={styles.pickerContainer}>
              <Text style={styles.pickerText}>{recipe.style}</Text>
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Batch Size (L)</Text>
              <TextInput
                style={styles.input}
                value={recipe.batchSize}
                onChangeText={(value) => updateRecipe('batchSize', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Boil Time (min)</Text>
              <TextInput
                style={styles.input}
                value={recipe.boilTime}
                onChangeText={(value) => updateRecipe('boilTime', value)}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Target OG</Text>
              <TextInput
                style={styles.input}
                value={recipe.og}
                onChangeText={(value) => updateRecipe('og', value)}
                keyboardType="decimal-pad"
              />
            </View>

            <View style={[styles.inputGroup, styles.halfWidth]}>
              <Text style={styles.inputLabel}>Target FG</Text>
              <TextInput
                style={styles.input}
                value={recipe.fg}
                onChangeText={(value) => updateRecipe('fg', value)}
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
                  value={malt.amount?.toString()}
                  onChangeText={(value) => updateMalt(index, 'amount', parseFloat(value) || 0)}
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
                    value={hop.amount?.toString()}
                    onChangeText={(value) => updateHop(index, 'amount', parseFloat(value) || 0)}
                    placeholder="Amount"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>g</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={hop.alphaAcid?.toString()}
                    onChangeText={(value) => updateHop(index, 'alphaAcid', parseFloat(value) || 0)}
                    placeholder="AA%"
                    keyboardType="decimal-pad"
                  />
                  <Text style={styles.unitText}>AA</Text>
                  <TextInput
                    style={[styles.input, styles.smallInput]}
                    value={hop.time?.toString()}
                    onChangeText={(value) => updateHop(index, 'time', parseFloat(value) || 0)}
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
            onChangeText={(value) => updateRecipe('notes', value)}
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
            {isLoading ? 'Saving...' : 'Save Recipe'}
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: YEAST_CREAM,
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
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 8,
    padding: 16,
    backgroundColor: 'white',
  },
  pickerText: {
    fontSize: 16,
    color: DEEP_BREW,
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
});