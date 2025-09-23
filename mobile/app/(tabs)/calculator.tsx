import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, ScrollView, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { createShadow } from '../../utils/shadows';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';
const YEAST_CREAM = '#FFF8E7';

export default function CalculatorScreen() {
  const [og, setOg] = useState('');
  const [fg, setFg] = useState('');
  const [abv, setAbv] = useState<number | null>(null);

  const calculateABV = () => {
    const ogNum = parseFloat(og);
    const fgNum = parseFloat(fg);

    if (ogNum && fgNum && ogNum > fgNum) {
      // Standard formula: ABV = (OG - FG) × 131.25
      const calculatedABV = (ogNum - fgNum) * 131.25;
      setAbv(Math.round(calculatedABV * 100) / 100);
    } else {
      setAbv(null);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Text style={styles.title}>Brewing Calculator</Text>

        <View style={styles.calculatorCard}>
          <Text style={styles.cardTitle}>ABV Calculator</Text>
          <Text style={styles.cardSubtitle}>Calculate alcohol by volume</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Original Gravity (OG)</Text>
            <TextInput
              style={styles.input}
              value={og}
              onChangeText={setOg}
              placeholder="1.050"
              keyboardType="decimal-pad"
              onEndEditing={calculateABV}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Final Gravity (FG)</Text>
            <TextInput
              style={styles.input}
              value={fg}
              onChangeText={setFg}
              placeholder="1.010"
              keyboardType="decimal-pad"
              onEndEditing={calculateABV}
            />
          </View>

          <TouchableOpacity style={styles.calculateButton} onPress={calculateABV}>
            <Text style={styles.calculateButtonText}>Calculate ABV</Text>
          </TouchableOpacity>

          {abv !== null && (
            <View style={styles.resultContainer}>
              <Text style={styles.resultLabel}>Alcohol by Volume</Text>
              <Text style={styles.resultValue}>{abv.toFixed(2)}%</Text>
            </View>
          )}
        </View>

        <View style={styles.calculatorCard}>
          <Text style={styles.cardTitle}>Quick Reference</Text>

          <View style={styles.referenceGrid}>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceTitle}>Light Beer</Text>
              <Text style={styles.referenceValue}>3.5-4.5% ABV</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceTitle}>Standard Beer</Text>
              <Text style={styles.referenceValue}>4.5-6.0% ABV</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceTitle}>Strong Beer</Text>
              <Text style={styles.referenceValue}>6.0-9.0% ABV</Text>
            </View>
            <View style={styles.referenceItem}>
              <Text style={styles.referenceTitle}>Very Strong</Text>
              <Text style={styles.referenceValue}>9.0%+ ABV</Text>
            </View>
          </View>
        </View>

        <View style={styles.calculatorCard}>
          <Text style={styles.cardTitle}>Efficiency Reference</Text>
          <Text style={styles.cardSubtitle}>Typical mash efficiency ranges</Text>

          <View style={styles.efficiencyList}>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyMethod}>Extract Brewing</Text>
              <Text style={styles.efficiencyValue}>~100%</Text>
            </View>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyMethod}>BIAB (Bag in a Bag)</Text>
              <Text style={styles.efficiencyValue}>65-75%</Text>
            </View>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyMethod}>All-Grain (Fly Sparge)</Text>
              <Text style={styles.efficiencyValue}>75-85%</Text>
            </View>
            <View style={styles.efficiencyItem}>
              <Text style={styles.efficiencyMethod}>All-Grain (Batch Sparge)</Text>
              <Text style={styles.efficiencyValue}>70-80%</Text>
            </View>
          </View>
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
  scrollContainer: {
    padding: 20,
  },
  title: {
    fontSize: 28,
    fontWeight: '700',
    color: DEEP_BREW,
    marginBottom: 20,
  },
  calculatorCard: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
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
    backgroundColor: '#FAFAFA',
  },
  calculateButton: {
    backgroundColor: MAESTRO_GOLD,
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  calculateButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  resultContainer: {
    backgroundColor: HOP_GREEN,
    padding: 20,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  resultLabel: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginBottom: 4,
  },
  resultValue: {
    color: 'white',
    fontSize: 32,
    fontWeight: '700',
  },
  referenceGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  referenceItem: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: YEAST_CREAM,
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  referenceTitle: {
    fontSize: 12,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4,
  },
  referenceValue: {
    fontSize: 14,
    fontWeight: '600',
    color: DEEP_BREW,
  },
  efficiencyList: {
    gap: 12,
  },
  efficiencyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  efficiencyMethod: {
    fontSize: 14,
    color: DEEP_BREW,
    flex: 1,
  },
  efficiencyValue: {
    fontSize: 14,
    fontWeight: '600',
    color: HOP_GREEN,
  },
});