import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { calculateABV, calculateIBUTinseth } from '../../utils/calculations';
import { createShadow } from '../../utils/shadows';

const MAESTRO_GOLD = '#F6C101';
const HOP_GREEN = '#81A742';
const DEEP_BREW = '#1A1A1A';

interface CalculatorProps {
  type: 'abv' | 'ibu';
  onResult?: (result: number) => void;
}

export const Calculator: React.FC<CalculatorProps> = ({ type, onResult }) => {
  const [inputs, setInputs] = useState<Record<string, string>>({});
  const [result, setResult] = useState<number | null>(null);

  const updateInput = (key: string, value: string) => {
    setInputs(prev => ({ ...prev, [key]: value }));
  };

  const calculate = () => {
    let calculatedResult = 0;

    if (type === 'abv') {
      const og = parseFloat(inputs.og || '0');
      const fg = parseFloat(inputs.fg || '0');
      calculatedResult = calculateABV(og, fg);
    } else if (type === 'ibu') {
      const hopAmount = parseFloat(inputs.hopAmount || '0');
      const alphaAcid = parseFloat(inputs.alphaAcid || '0');
      const boilTime = parseFloat(inputs.boilTime || '0');
      const batchSize = parseFloat(inputs.batchSize || '0');
      const og = parseFloat(inputs.og || '0');
      calculatedResult = calculateIBUTinseth(hopAmount, alphaAcid, boilTime, batchSize, og);
    }

    setResult(calculatedResult);
    onResult?.(calculatedResult);
  };

  const renderABVCalculator = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Original Gravity (OG)</Text>
        <TextInput
          style={styles.input}
          value={inputs.og}
          onChangeText={(value) => updateInput('og', value)}
          placeholder="1.050"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Final Gravity (FG)</Text>
        <TextInput
          style={styles.input}
          value={inputs.fg}
          onChangeText={(value) => updateInput('fg', value)}
          placeholder="1.010"
          keyboardType="decimal-pad"
        />
      </View>
    </>
  );

  const renderIBUCalculator = () => (
    <>
      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Hop Amount (grams)</Text>
        <TextInput
          style={styles.input}
          value={inputs.hopAmount}
          onChangeText={(value) => updateInput('hopAmount', value)}
          placeholder="30"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Alpha Acid (%)</Text>
        <TextInput
          style={styles.input}
          value={inputs.alphaAcid}
          onChangeText={(value) => updateInput('alphaAcid', value)}
          placeholder="12.5"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Boil Time (minutes)</Text>
        <TextInput
          style={styles.input}
          value={inputs.boilTime}
          onChangeText={(value) => updateInput('boilTime', value)}
          placeholder="60"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Batch Size (liters)</Text>
        <TextInput
          style={styles.input}
          value={inputs.batchSize}
          onChangeText={(value) => updateInput('batchSize', value)}
          placeholder="20"
          keyboardType="decimal-pad"
        />
      </View>

      <View style={styles.inputGroup}>
        <Text style={styles.inputLabel}>Original Gravity</Text>
        <TextInput
          style={styles.input}
          value={inputs.og}
          onChangeText={(value) => updateInput('og', value)}
          placeholder="1.050"
          keyboardType="decimal-pad"
        />
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        {type === 'abv' ? 'ABV Calculator' : 'IBU Calculator'}
      </Text>

      {type === 'abv' ? renderABVCalculator() : renderIBUCalculator()}

      <TouchableOpacity style={styles.calculateButton} onPress={calculate}>
        <Text style={styles.calculateButtonText}>Calculate</Text>
      </TouchableOpacity>

      {result !== null && (
        <View style={styles.resultContainer}>
          <Text style={styles.resultLabel}>
            {type === 'abv' ? 'Alcohol by Volume' : 'International Bitterness Units'}
          </Text>
          <Text style={styles.resultValue}>
            {result.toFixed(type === 'abv' ? 2 : 1)}{type === 'abv' ? '%' : ' IBU'}
          </Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    borderRadius: 16,
    padding: 20,
    margin: 20,
    ...createShadow('#000', { width: 0, height: 1 }, 0.1, 2, 2),
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: DEEP_BREW,
    marginBottom: 20,
    textAlign: 'center',
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
});