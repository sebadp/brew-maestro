import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { MaterialCommunityIcons } from '@expo/vector-icons';

type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

interface StepTrackingProps {
  selectedLevel: ExperienceLevel;
  onSelectLevel: (level: ExperienceLevel) => void;
  onNext: () => void;
}

const LEVEL_CARDS: Array<{
  id: ExperienceLevel;
  title: string;
  subtitle: string;
  color: string;
}> = [
  { id: 'beginner', title: 'Principiante', subtitle: 'Guías paso a paso', color: '#27AE60' },
  { id: 'intermediate', title: 'Intermedio', subtitle: 'Herramientas completas', color: '#F6C101' },
  { id: 'advanced', title: 'Avanzado', subtitle: 'Modo experto', color: '#FF6B35' },
];

const FEATURES = [
  'Tracking automático de fermentación',
  'Alertas inteligentes en momentos clave',
  'Cálculos de ABV en tiempo real',
  'Historial completo de tus brews',
];

const CTA_COLOR = '#81A742';

export const StepTracking: React.FC<StepTrackingProps> = ({ selectedLevel, onSelectLevel, onNext }) => {
  return (
    <View style={styles.container}>
      <View style={styles.mockArea}>
        <View style={styles.mockCardActive}>
          <Text style={styles.mockTitle}>Brewing</Text>
          <Text style={styles.mockBeer}>Summer Pale Ale</Text>
          <Text style={styles.mockStatus}>En hervor · 45min</Text>
        </View>
        <View style={styles.mockCardFermenting}>
          <Text style={styles.mockTitle}>Fermenting</Text>
          <Text style={styles.mockBeer}>American IPA</Text>
          <View style={styles.mockRow}>
            <MaterialCommunityIcons name="timer-sand" size={16} color="#81A742" />
            <Text style={styles.mockStatus}>Día 5 / 14</Text>
          </View>
        </View>
        <View style={styles.mockCardCompleted}>
          <Text style={styles.mockTitle}>Completed</Text>
          <Text style={styles.mockBeer}>Dry Stout</Text>
          <Text style={styles.mockStatus}>ABV 5.8% • Listo para servir</Text>
        </View>
      </View>

      <View style={styles.content}>
        <Text style={styles.headline}>Nunca Pierdas el Control</Text>
        <Text style={styles.subtitle}>Monitorea cada etapa de tu cerveza automáticamente</Text>

        <View style={styles.features}>
          {FEATURES.map(feature => (
            <View key={feature} style={styles.featureRow}>
              <MaterialCommunityIcons name="check-circle" size={18} color="#81A742" />
              <Text style={styles.featureText}>{feature}</Text>
            </View>
          ))}
        </View>

        <View style={styles.levelsRow}>
          {LEVEL_CARDS.map(level => {
            const selected = selectedLevel === level.id;
            return (
              <TouchableOpacity
                key={level.id}
                activeOpacity={0.9}
                style={[styles.levelCard, selected && { borderColor: level.color, backgroundColor: 'white' }]}
                onPress={() => onSelectLevel(level.id)}
              >
                <View style={[styles.levelBadge, { backgroundColor: level.color }]} />
                <Text style={styles.levelTitle}>{level.title}</Text>
                <Text style={styles.levelSubtitle}>{level.subtitle}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.ctaButton} onPress={onNext}>
          <Text style={styles.ctaText}>Ver Mi Dashboard</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF8E7',
    padding: 24,
  },
  mockArea: {
    alignItems: 'center',
    gap: 12,
  },
  mockCardBase: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: 'white',
    elevation: 2,
  },
  mockCardActive: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#FFF2C4',
    elevation: 2,
  },
  mockCardFermenting: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#E5F5DF',
    elevation: 2,
  },
  mockCardCompleted: {
    width: '100%',
    borderRadius: 18,
    padding: 16,
    backgroundColor: '#E0E9F9',
    elevation: 2,
  },
  mockTitle: {
    color: '#6B6B6B',
    fontSize: 12,
    textTransform: 'uppercase',
    fontWeight: '600',
  },
  mockBeer: {
    color: '#1A1A1A',
    fontSize: 16,
    fontWeight: '700',
    marginTop: 4,
  },
  mockStatus: {
    color: '#555',
    marginTop: 6,
    fontSize: 13,
  },
  mockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  content: {
    marginTop: 28,
    gap: 16,
  },
  headline: {
    color: '#1A1A1A',
    fontSize: 26,
    fontWeight: '800',
  },
  subtitle: {
    color: '#6C6C6C',
    fontSize: 16,
    lineHeight: 22,
  },
  features: {
    gap: 10,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  featureText: {
    flex: 1,
    color: '#4B4B4B',
    fontSize: 14,
  },
  levelsRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  levelCard: {
    flex: 1,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.08)',
    padding: 14,
    backgroundColor: '#F7F3E8',
  },
  levelBadge: {
    width: 36,
    height: 6,
    borderRadius: 4,
    marginBottom: 10,
  },
  levelTitle: {
    color: '#222',
    fontSize: 16,
    fontWeight: '700',
  },
  levelSubtitle: {
    color: '#6B6B6B',
    fontSize: 12,
    marginTop: 4,
  },
  ctaButton: {
    marginTop: 20,
    alignSelf: 'center',
    backgroundColor: CTA_COLOR,
    paddingHorizontal: 28,
    paddingVertical: 16,
    borderRadius: 22,
  },
  ctaText: {
    color: 'white',
    fontWeight: '700',
    fontSize: 16,
  },
});
